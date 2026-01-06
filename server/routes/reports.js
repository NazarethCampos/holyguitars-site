import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { db } from '../config/firebase-admin.js';
import admin from 'firebase-admin';
import { createNotification } from './notifications.js';

const router = express.Router();

// Report a post
router.post('/posts/:id', verifyToken, async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { reason, description } = req.body;

    if (!reason || reason.trim() === '') {
      return res.status(400).json({ error: 'Report reason is required' });
    }

    const validReasons = [
      'spam',
      'harassment',
      'hate_speech',
      'violence',
      'inappropriate_content',
      'misinformation',
      'copyright',
      'other'
    ];

    if (!validReasons.includes(reason)) {
      return res.status(400).json({ error: 'Invalid report reason' });
    }

    // Check if post exists
    const postRef = db.collection('posts').doc(req.params.id);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const postData = postDoc.data();

    // Check if user already reported this post
    const existingReport = await db.collection('reports')
      .where('reporterId', '==', req.user.uid)
      .where('targetType', '==', 'post')
      .where('targetId', '==', req.params.id)
      .get();

    if (!existingReport.empty) {
      return res.status(400).json({ error: 'You have already reported this post' });
    }

    // Create report
    const reportData = {
      targetType: 'post',
      targetId: req.params.id,
      targetAuthorId: postData.authorId,
      reporterId: req.user.uid,
      reporterName: req.user.name || req.user.email,
      reason,
      description: description || '',
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const reportRef = await db.collection('reports').add(reportData);

    // Increment report count on post
    await postRef.update({
      reportCount: admin.firestore.FieldValue.increment(1)
    });

    res.status(201).json({
      id: reportRef.id,
      ...reportData,
      createdAt: new Date().toISOString(),
      message: 'Report submitted successfully'
    });
  } catch (error) {
    console.error('Error reporting post:', error);
    res.status(500).json({ error: error.message });
  }
});

// Report a comment
router.post('/comments/:id', verifyToken, async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { reason, description, postId } = req.body;

    if (!reason || reason.trim() === '') {
      return res.status(400).json({ error: 'Report reason is required' });
    }

    if (!postId) {
      return res.status(400).json({ error: 'Post ID is required' });
    }

    const validReasons = [
      'spam',
      'harassment',
      'hate_speech',
      'violence',
      'inappropriate_content',
      'misinformation',
      'other'
    ];

    if (!validReasons.includes(reason)) {
      return res.status(400).json({ error: 'Invalid report reason' });
    }

    // Check if comment exists
    const commentRef = db.collection('posts').doc(postId).collection('comments').doc(req.params.id);
    const commentDoc = await commentRef.get();

    if (!commentDoc.exists) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const commentData = commentDoc.data();

    // Check if user already reported this comment
    const existingReport = await db.collection('reports')
      .where('reporterId', '==', req.user.uid)
      .where('targetType', '==', 'comment')
      .where('targetId', '==', req.params.id)
      .get();

    if (!existingReport.empty) {
      return res.status(400).json({ error: 'You have already reported this comment' });
    }

    // Create report
    const reportData = {
      targetType: 'comment',
      targetId: req.params.id,
      postId: postId,
      targetAuthorId: commentData.userId,
      reporterId: req.user.uid,
      reporterName: req.user.name || req.user.email,
      reason,
      description: description || '',
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const reportRef = await db.collection('reports').add(reportData);

    res.status(201).json({
      id: reportRef.id,
      ...reportData,
      createdAt: new Date().toISOString(),
      message: 'Report submitted successfully'
    });
  } catch (error) {
    console.error('Error reporting comment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Report a user
router.post('/users/:uid', verifyToken, async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { reason, description } = req.body;

    if (!reason || reason.trim() === '') {
      return res.status(400).json({ error: 'Report reason is required' });
    }

    const validReasons = [
      'spam',
      'harassment',
      'impersonation',
      'inappropriate_profile',
      'suspicious_activity',
      'other'
    ];

    if (!validReasons.includes(reason)) {
      return res.status(400).json({ error: 'Invalid report reason' });
    }

    // Check if user exists
    const userRef = db.collection('users').doc(req.params.uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user already reported this user
    const existingReport = await db.collection('reports')
      .where('reporterId', '==', req.user.uid)
      .where('targetType', '==', 'user')
      .where('targetId', '==', req.params.uid)
      .get();

    if (!existingReport.empty) {
      return res.status(400).json({ error: 'You have already reported this user' });
    }

    // Create report
    const reportData = {
      targetType: 'user',
      targetId: req.params.uid,
      reporterId: req.user.uid,
      reporterName: req.user.name || req.user.email,
      reason,
      description: description || '',
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const reportRef = await db.collection('reports').add(reportData);

    res.status(201).json({
      id: reportRef.id,
      ...reportData,
      createdAt: new Date().toISOString(),
      message: 'Report submitted successfully'
    });
  } catch (error) {
    console.error('Error reporting user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Block a user
router.post('/block/:uid', verifyToken, async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }

    // Check if user exists
    const userRef = db.collection('users').doc(req.params.uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already blocked
    const existingBlock = await db.collection('blocks')
      .where('blockerId', '==', req.user.uid)
      .where('blockedUserId', '==', req.params.uid)
      .get();

    if (!existingBlock.empty) {
      return res.status(400).json({ error: 'User is already blocked' });
    }

    // Create block
    const blockData = {
      blockerId: req.user.uid,
      blockedUserId: req.params.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const blockRef = await db.collection('blocks').add(blockData);

    res.status(201).json({
      id: blockRef.id,
      ...blockData,
      createdAt: new Date().toISOString(),
      message: 'User blocked successfully'
    });
  } catch (error) {
    console.error('Error blocking user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Unblock a user
router.delete('/block/:uid', verifyToken, async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const blocksSnapshot = await db.collection('blocks')
      .where('blockerId', '==', req.user.uid)
      .where('blockedUserId', '==', req.params.uid)
      .get();

    if (blocksSnapshot.empty) {
      return res.status(404).json({ error: 'Block not found' });
    }

    // Delete all blocks (should only be one)
    const batch = db.batch();
    blocksSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    res.json({ message: 'User unblocked successfully' });
  } catch (error) {
    console.error('Error unblocking user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user's blocked users list
router.get('/blocked', verifyToken, async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const blocksSnapshot = await db.collection('blocks')
      .where('blockerId', '==', req.user.uid)
      .get();

    const blockedUserIds = blocksSnapshot.docs.map(doc => doc.data().blockedUserId);

    // Get blocked users' data
    const blockedUsers = [];
    for (const uid of blockedUserIds) {
      const userDoc = await db.collection('users').doc(uid).get();
      if (userDoc.exists) {
        blockedUsers.push({
          id: userDoc.id,
          ...userDoc.data()
        });
      }
    }

    res.json({ blockedUsers, total: blockedUsers.length });
  } catch (error) {
    console.error('Error fetching blocked users:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
