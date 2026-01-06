import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { db } from '../config/firebase-admin.js';
import admin from 'firebase-admin';

const router = express.Router();

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    
    if (!userDoc.exists) {
      return res.status(403).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    
    if (userData.role !== 'admin' && userData.role !== 'moderator') {
      return res.status(403).json({ error: 'Access denied. Admin or moderator role required.' });
    }

    req.userRole = userData.role;
    next();
  } catch (error) {
    console.error('Error checking admin status:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get dashboard statistics
router.get('/stats', verifyToken, isAdmin, async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }

    // Get total users
    const usersSnapshot = await db.collection('users').count().get();
    const totalUsers = usersSnapshot.data().count;

    // Get total posts
    const postsSnapshot = await db.collection('posts').count().get();
    const totalPosts = postsSnapshot.data().count;

    // Get total comments (approximate - iterate through posts)
    const postsQuery = await db.collection('posts').select('commentsCount').get();
    let totalComments = 0;
    postsQuery.forEach(doc => {
      totalComments += doc.data().commentsCount || 0;
    });

    // Get total reports
    const reportsSnapshot = await db.collection('reports').where('status', '==', 'pending').count().get();
    const pendingReports = reportsSnapshot.data().count;

    // Get recent users (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentUsersSnapshot = await db.collection('users')
      .where('createdAt', '>=', sevenDaysAgo.toISOString())
      .count()
      .get();
    const newUsersThisWeek = recentUsersSnapshot.data().count;

    // Get recent posts (last 7 days)
    const recentPostsSnapshot = await db.collection('posts')
      .where('createdAt', '>=', admin.firestore.Timestamp.fromDate(sevenDaysAgo))
      .count()
      .get();
    const newPostsThisWeek = recentPostsSnapshot.data().count;

    res.json({
      totalUsers,
      totalPosts,
      totalComments,
      pendingReports,
      newUsersThisWeek,
      newPostsThisWeek
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all users with pagination
router.get('/users', verifyToken, isAdmin, async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { limit = 20, offset = 0, role, searchQuery } = req.query;

    let query = db.collection('users');

    if (role) {
      query = query.where('role', '==', role);
    }

    query = query.orderBy('createdAt', 'desc')
      .limit(parseInt(limit))
      .offset(parseInt(offset));

    const snapshot = await query.get();
    let users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Client-side search if searchQuery provided (Firestore doesn't support full-text search)
    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      users = users.filter(user => 
        user.displayName?.toLowerCase().includes(search) ||
        user.email?.toLowerCase().includes(search)
      );
    }

    res.json({ users, total: snapshot.size });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update user role
router.put('/users/:uid/role', verifyToken, isAdmin, async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { role } = req.body;

    if (!['admin', 'moderator', 'member'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Only admin can change roles
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Only admins can change user roles' });
    }

    const userRef = db.collection('users').doc(req.params.uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    await userRef.update({
      role: role,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    const updatedUser = await userRef.get();
    res.json({
      id: updatedUser.id,
      ...updatedUser.data()
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: error.message });
  }
});

// Ban/unban user
router.put('/users/:uid/ban', verifyToken, isAdmin, async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { banned, reason } = req.body;

    const userRef = db.collection('users').doc(req.params.uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    await userRef.update({
      banned: banned === true,
      banReason: banned ? reason : null,
      bannedAt: banned ? admin.firestore.FieldValue.serverTimestamp() : null,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    const updatedUser = await userRef.get();
    res.json({
      id: updatedUser.id,
      ...updatedUser.data()
    });
  } catch (error) {
    console.error('Error banning user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete user
router.delete('/users/:uid', verifyToken, isAdmin, async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }

    // Only admin can delete users
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Only admins can delete users' });
    }

    const userRef = db.collection('users').doc(req.params.uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete all user's posts
    const postsSnapshot = await db.collection('posts')
      .where('authorId', '==', req.params.uid)
      .get();

    const batch = db.batch();
    postsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    // Delete user document
    await userRef.delete();

    res.json({ message: 'User and all associated data deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all posts with filters (for moderation)
router.get('/posts', verifyToken, isAdmin, async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { limit = 20, offset = 0, category, reported } = req.query;

    let query = db.collection('posts');

    if (category) {
      query = query.where('category', '==', category);
    }

    if (reported === 'true') {
      query = query.where('reportCount', '>', 0);
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

// Delete any post (admin/moderator)
router.delete('/posts/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const postRef = db.collection('posts').doc(req.params.id);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      return res.status(404).json({ error: 'Post not found' });
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

// Get all reports
router.get('/reports', verifyToken, isAdmin, async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { limit = 20, offset = 0, status = 'pending' } = req.query;

    let query = db.collection('reports');

    if (status) {
      query = query.where('status', '==', status);
    }

    query = query.orderBy('createdAt', 'desc')
      .limit(parseInt(limit))
      .offset(parseInt(offset));

    const snapshot = await query.get();
    const reports = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({ reports, total: snapshot.size });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update report status
router.put('/reports/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { status, action } = req.body;

    if (!['pending', 'reviewing', 'resolved', 'dismissed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const reportRef = db.collection('reports').doc(req.params.id);
    const reportDoc = await reportRef.get();

    if (!reportDoc.exists) {
      return res.status(404).json({ error: 'Report not found' });
    }

    await reportRef.update({
      status,
      action: action || null,
      reviewedBy: req.user.uid,
      reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    const updatedReport = await reportRef.get();
    res.json({
      id: updatedReport.id,
      ...updatedReport.data()
    });
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
