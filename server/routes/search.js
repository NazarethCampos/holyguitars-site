import express from 'express';
import { optionalAuth } from '../middleware/auth.js';
import { db } from '../config/firebase-admin.js';

const router = express.Router();

// Search posts, users, and comments
router.get('/', optionalAuth, async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { q, type = 'all', limit = 20, category } = req.query;

    if (!q || q.trim() === '') {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const searchQuery = q.toLowerCase();
    const results = {
      posts: [],
      users: [],
      total: 0
    };

    // Search posts
    if (type === 'all' || type === 'posts') {
      let postsQuery = db.collection('posts');
      
      if (category) {
        postsQuery = postsQuery.where('category', '==', category);
      }
      
      postsQuery = postsQuery.limit(parseInt(limit));
      
      const postsSnapshot = await postsQuery.get();
      
      // Filter posts client-side (Firestore doesn't support full-text search)
      results.posts = postsSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(post => 
          post.title?.toLowerCase().includes(searchQuery) ||
          post.description?.toLowerCase().includes(searchQuery) ||
          post.brand?.toLowerCase().includes(searchQuery) ||
          post.model?.toLowerCase().includes(searchQuery)
        )
        .slice(0, parseInt(limit));
    }

    // Search users
    if (type === 'all' || type === 'users') {
      const usersQuery = db.collection('users').limit(parseInt(limit));
      const usersSnapshot = await usersQuery.get();
      
      // Filter users client-side
      results.users = usersSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(user => 
          user.displayName?.toLowerCase().includes(searchQuery) ||
          user.email?.toLowerCase().includes(searchQuery) ||
          user.bio?.toLowerCase().includes(searchQuery)
        )
        .slice(0, parseInt(limit));
    }

    results.total = results.posts.length + results.users.length;

    res.json(results);
  } catch (error) {
    console.error('Error searching:', error);
    res.status(500).json({ error: error.message });
  }
});

// Search posts by category and subcategory
router.get('/posts', optionalAuth, async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { q, category, subcategory, limit = 20 } = req.query;

    let query = db.collection('posts');

    if (category) {
      query = query.where('category', '==', category);
    }

    if (subcategory) {
      query = query.where('subcategory', '==', subcategory);
    }

    query = query.limit(parseInt(limit));

    const snapshot = await query.get();
    let posts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Apply text search if query provided
    if (q && q.trim() !== '') {
      const searchQuery = q.toLowerCase();
      posts = posts.filter(post => 
        post.title?.toLowerCase().includes(searchQuery) ||
        post.description?.toLowerCase().includes(searchQuery) ||
        post.brand?.toLowerCase().includes(searchQuery) ||
        post.model?.toLowerCase().includes(searchQuery)
      );
    }

    res.json({ posts, total: posts.length });
  } catch (error) {
    console.error('Error searching posts:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get trending/popular posts
router.get('/trending', optionalAuth, async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { limit = 10, category } = req.query;

    let query = db.collection('posts');

    if (category) {
      query = query.where('category', '==', category);
    }

    // Get posts with most likes (trending)
    query = query.orderBy('likes', 'desc').limit(parseInt(limit));

    const snapshot = await query.get();
    const posts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({ posts, total: posts.length });
  } catch (error) {
    console.error('Error fetching trending posts:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
