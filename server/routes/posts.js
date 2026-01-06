import express from 'express';
import multer from 'multer';
import { verifyToken, optionalAuth } from '../middleware/auth.js';
import { db, storage } from '../config/firebase-admin.js';
import admin from 'firebase-admin';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'));
    }
  }
});

// Get all posts or filter by category
router.get('/', optionalAuth, async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { category, subcategory, limit = 20, offset = 0 } = req.query;
    
    let query = db.collection('posts');

    if (category) {
      query = query.where('category', '==', category);
    }
    if (subcategory) {
      query = query.where('subcategory', '==', subcategory);
    }

    query = query.orderBy('createdAt', 'desc')
      .limit(parseInt(limit))
      .offset(parseInt(offset));

    const snapshot = await query.get();
    const posts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({ posts, total: snapshot.size });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single post by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const postDoc = await db.collection('posts').doc(req.params.id).get();

    if (!postDoc.exists) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Get comments for this post
    const commentsSnapshot = await db.collection('posts')
      .doc(req.params.id)
      .collection('comments')
      .orderBy('createdAt', 'desc')
      .get();

    const comments = commentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({ 
      id: postDoc.id,
      ...postDoc.data(),
      comments
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: error.message });
  }
});

// Upload file to Firebase Storage
async function uploadFile(file, folder = 'uploads') {
  if (!storage) {
    throw new Error('Storage not available');
  }

  const bucket = storage.bucket();
  const fileName = `${folder}/${Date.now()}_${file.originalname}`;
  const fileUpload = bucket.file(fileName);

  await fileUpload.save(file.buffer, {
    metadata: {
      contentType: file.mimetype,
    },
  });

  await fileUpload.makePublic();

  return `https://storage.googleapis.com/${bucket.name}/${fileName}`;
}

// Create new post (protected)
router.post('/', verifyToken, upload.single('file'), async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const {
      title,
      description,
      category,
      subcategory,
      videoUrl,
      brand,
      model
    } = req.body;

    // Validate required fields
    if (!title || !category) {
      return res.status(400).json({ error: 'Title and category are required' });
    }

    const postData = {
      title,
      description: description || '',
      category,
      subcategory: subcategory || '',
      authorId: req.user.uid,
      authorName: req.user.name || req.user.email,
      authorPhoto: req.user.picture || null,
      likes: 0,
      commentsCount: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Handle file upload
    if (req.file) {
      const folder = req.file.mimetype.startsWith('image/') ? 'images' : 'videos';
      const fileUrl = await uploadFile(req.file, folder);
      
      if (req.file.mimetype.startsWith('image/')) {
        postData.imageUrl = fileUrl;
      } else {
        postData.videoFileUrl = fileUrl;
      }
    }

    // Add video URL for YouTube embeds
    if (videoUrl) {
      postData.videoUrl = videoUrl;
    }

    // Add equipment specific fields
    if (category === 'equipment') {
      if (brand) postData.brand = brand;
      if (model) postData.model = model;
    }

    const docRef = await db.collection('posts').add(postData);

    res.status(201).json({ 
      id: docRef.id,
      ...postData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update post (protected)
router.put('/:id', verifyToken, upload.single('file'), async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const postRef = db.collection('posts').doc(req.params.id);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const postData = postDoc.data();

    // Check if user is the author
    if (postData.authorId !== req.user.uid) {
      return res.status(403).json({ error: 'Not authorized to update this post' });
    }

    const updates = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Update allowed fields
    const allowedFields = ['title', 'description', 'subcategory', 'videoUrl', 'brand', 'model'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Handle new file upload
    if (req.file) {
      const folder = req.file.mimetype.startsWith('image/') ? 'images' : 'videos';
      const fileUrl = await uploadFile(req.file, folder);
      
      if (req.file.mimetype.startsWith('image/')) {
        updates.imageUrl = fileUrl;
      } else {
        updates.videoFileUrl = fileUrl;
      }
    }

    await postRef.update(updates);

    const updatedPost = await postRef.get();
    res.json({ 
      id: updatedPost.id,
      ...updatedPost.data()
    });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete post (protected)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const postRef = db.collection('posts').doc(req.params.id);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const postData = postDoc.data();

    // Check if user is the author
    if (postData.authorId !== req.user.uid) {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }

    // Delete all comments
    const commentsSnapshot = await postRef.collection('comments').get();
    const batch = db.batch();
    commentsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    // Delete the post
    await postRef.delete();

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: error.message });
  }
});

// Like/unlike post (protected)
router.post('/:id/like', verifyToken, async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const postRef = db.collection('posts').doc(req.params.id);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const likesRef = postRef.collection('likes').doc(req.user.uid);
    const likeDoc = await likesRef.get();

    if (likeDoc.exists) {
      // Unlike
      await likesRef.delete();
      await postRef.update({
        likes: admin.firestore.FieldValue.increment(-1)
      });
      res.json({ liked: false, message: 'Post unliked' });
    } else {
      // Like
      await likesRef.set({
        userId: req.user.uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      await postRef.update({
        likes: admin.firestore.FieldValue.increment(1)
      });
      res.json({ liked: true, message: 'Post liked' });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get comments for a post
router.get('/:id/comments', optionalAuth, async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const commentsSnapshot = await db.collection('posts')
      .doc(req.params.id)
      .collection('comments')
      .orderBy('createdAt', 'desc')
      .get();

    const comments = commentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({ comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add comment (protected) - supports nested replies
router.post('/:id/comments', verifyToken, async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { content, parentId } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    const postRef = db.collection('posts').doc(req.params.id);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // If parentId is provided, verify parent comment exists
    if (parentId) {
      const parentCommentDoc = await postRef.collection('comments').doc(parentId).get();
      if (!parentCommentDoc.exists) {
        return res.status(404).json({ error: 'Parent comment not found' });
      }
    }

    const commentData = {
      postId: req.params.id,
      userId: req.user.uid,
      userName: req.user.name || req.user.email,
      userPhoto: req.user.picture || null,
      content: content.trim(),
      parentId: parentId || null,
      likes: 0,
      repliesCount: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const commentRef = await postRef.collection('comments').add(commentData);

    // Increment comments count on post
    await postRef.update({
      commentsCount: admin.firestore.FieldValue.increment(1)
    });

    // If this is a reply, increment replies count on parent comment
    if (parentId) {
      await postRef.collection('comments').doc(parentId).update({
        repliesCount: admin.firestore.FieldValue.increment(1)
      });
    }

    res.status(201).json({ 
      id: commentRef.id,
      ...commentData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update comment (protected)
router.put('/:postId/comments/:commentId', verifyToken, async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { content } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    const commentRef = db.collection('posts')
      .doc(req.params.postId)
      .collection('comments')
      .doc(req.params.commentId);

    const commentDoc = await commentRef.get();

    if (!commentDoc.exists) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const commentData = commentDoc.data();

    // Check if user is the author
    if (commentData.userId !== req.user.uid) {
      return res.status(403).json({ error: 'Not authorized to update this comment' });
    }

    await commentRef.update({
      content: content.trim(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    const updatedComment = await commentRef.get();
    res.json({ 
      id: updatedComment.id,
      ...updatedComment.data()
    });
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete comment (protected)
router.delete('/:postId/comments/:commentId', verifyToken, async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const postRef = db.collection('posts').doc(req.params.postId);
    const commentRef = postRef.collection('comments').doc(req.params.commentId);
    const commentDoc = await commentRef.get();

    if (!commentDoc.exists) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const commentData = commentDoc.data();

    // Check if user is the author
    if (commentData.userId !== req.user.uid) {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }

    // If this is a parent comment with replies, delete all replies
    if (commentData.repliesCount > 0) {
      const repliesSnapshot = await postRef.collection('comments')
        .where('parentId', '==', req.params.commentId)
        .get();
      
      const batch = db.batch();
      repliesSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      
      // Decrement total comments count by replies count + 1
      await postRef.update({
        commentsCount: admin.firestore.FieldValue.increment(-(commentData.repliesCount + 1))
      });
    } else {
      await commentRef.delete();
      
      // Decrement comments count
      await postRef.update({
        commentsCount: admin.firestore.FieldValue.increment(-1)
      });
      
      // If this is a reply, decrement parent's replies count
      if (commentData.parentId) {
        await postRef.collection('comments').doc(commentData.parentId).update({
          repliesCount: admin.firestore.FieldValue.increment(-1)
        });
      }
    }

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Like/unlike comment (protected)
router.post('/:postId/comments/:commentId/like', verifyToken, async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const commentRef = db.collection('posts')
      .doc(req.params.postId)
      .collection('comments')
      .doc(req.params.commentId);
    
    const commentDoc = await commentRef.get();

    if (!commentDoc.exists) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const likesRef = commentRef.collection('likes').doc(req.user.uid);
    const likeDoc = await likesRef.get();

    if (likeDoc.exists) {
      // Unlike
      await likesRef.delete();
      await commentRef.update({
        likes: admin.firestore.FieldValue.increment(-1)
      });
      res.json({ liked: false, message: 'Comment unliked' });
    } else {
      // Like
      await likesRef.set({
        userId: req.user.uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      await commentRef.update({
        likes: admin.firestore.FieldValue.increment(1)
      });
      res.json({ liked: true, message: 'Comment liked' });
    }
  } catch (error) {
    console.error('Error toggling comment like:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get comment replies (nested comments)
router.get('/:postId/comments/:commentId/replies', optionalAuth, async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const repliesSnapshot = await db.collection('posts')
      .doc(req.params.postId)
      .collection('comments')
      .where('parentId', '==', req.params.commentId)
      .orderBy('createdAt', 'asc')
      .get();

    const replies = repliesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({ replies });
  } catch (error) {
    console.error('Error fetching replies:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
