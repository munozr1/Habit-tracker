import express from 'express';
import LocalData from '../models/LocalData.js';

const router = express.Router();

router.post('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    const userId = req.headers['x-user-id'] || 'anonymous';
    
    await LocalData.findOneAndUpdate(
      { userId, key },
      { userId, key, value },
      { upsert: true, new: true }
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving localStorage:', error);
    res.status(500).json({ success: false, error: 'Failed to save data' });
  }
});

router.get('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const userId = req.headers['x-user-id'] || 'anonymous';
    
    const data = await LocalData.findOne({ userId, key });
    res.json({ success: true, value: data ? data.value : null });
  } catch (error) {
    console.error('Error getting localStorage:', error);
    res.status(500).json({ success: false, error: 'Failed to get data' });
  }
});

router.get('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'anonymous';
    const data = await LocalData.getAllForUser(userId);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error getting all localStorage data:', error);
    res.status(500).json({ success: false, error: 'Failed to get all data' });
  }
});

router.delete('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const userId = req.headers['x-user-id'] || 'anonymous';
    
    await LocalData.deleteOne({ userId, key });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting localStorage data:', error);
    res.status(500).json({ success: false, error: 'Failed to delete data' });
  }
});

export default router;