import { Router } from 'express';
import verifyToken from '../middleware/authMiddleware.js';

const router = Router();

// Protected portals for students and teachers
router.get('/data', verifyToken, (req, res) => {
  res.json({
    message: 'You can access the page!!',
    user: req.user,
  });
});

export default router;
