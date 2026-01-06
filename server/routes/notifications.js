import express from 'express';
import { verifyToken, optionalAuth } from '../middleware/auth.js';
import { db } from '../config/firebase-admin.js';
import admin from 'firebase-admin';

const router = express.Router();

// Get user's notifications
router.get('/', verifyToken, async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { limit = 20, offset = 0, unreadOnly = false } = req.query;

    let query = db.collection('notifications')
      .where('userId', '==', req.user.uid)
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limit))
      .offset(parseInt(offset));

    if (unreadOnly === 'true') {
      query = query.where('read', '==', false);
    }

    const snapshot = await query.get();
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({ notifications, total: snapshot.size });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get unread notification count
router.get('/count', verifyToken, async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const snapshot = await db.collection('notifications')
      .where('userId', '==', req.user.uid)
      .where('read', '==', false)
      .count()
      .get();

    res.json({ count: snapshot.data().count });
  } catch (error) {
    console.error('Error fetching notification count:', error);
    res.status(500).json({ error: error.message });
  }
});

// Mark notification as read
router.put('/:id/read', verifyToken, async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const notificationRef = db.collection('notifications').doc(req.params.id);
    const notificationDoc = await notificationRef.get();

    if (!notificationDoc.exists) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    const notificationData = notificationDoc.data();

    // Check if notification belongs to user
    if (notificationData.userId !== req.user.uid) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await notificationRef.update({
      read: true,
      readAt: admin.firestore.FieldValue.serverTimestamp()
    });

    const updatedNotification = await notificationRef.get();
    res.json({
      id: updatedNotification.id,
      ...updatedNotification.data()
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: error.message });
  }
});

// Mark all notifications as read
router.put('/read-all', verifyToken, async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const snapshot = await db.collection('notifications')
      .where('userId', '==', req.user.uid)
      .where('read', '==', false)
      .get();

    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, {
        read: true,
        readAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });

    await batch.commit();

    res.json({ message: 'All notifications marked as read', count: snapshot.size });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete notification
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const notificationRef = db.collection('notifications').doc(req.params.id);
    const notificationDoc = await notificationRef.get();

    if (!notificationDoc.exists) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    const notificationData = notificationDoc.data();

    // Check if notification belongs to user
    if (notificationData.userId !== req.user.uid) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await notificationRef.delete();

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper function to create notification (exported for use in other routes)
export async function createNotification(data) {
  try {
    if (!db) {
      console.error('Database not available for notification');
      return;
    }

    const { userId, type, title, message, link, fromUserId, fromUserName, fromUserPhoto } = data;

    const notificationData = {
      userId,
      type, // 'comment', 'reply', 'like', 'follow', 'mention', 'report', 'system'
      title,
      message,
      link: link || null,
      fromUserId: fromUserId || null,
      fromUserName: fromUserName || null,
      fromUserPhoto: fromUserPhoto || null,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('notifications').add(notificationData);
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}

export default router;
