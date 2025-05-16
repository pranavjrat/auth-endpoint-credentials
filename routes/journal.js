import { Router } from 'express';
import verifyToken from '../middleware/authMiddleware.js';
import { isTeacher } from '../middleware/roleMiddleware.js';
import {
  createJournal,
  deleteJournal,
  getJournal,
  getJournalFeed,
  updateJournal,
} from '../controllers/journalController.js';

const router = Router();

router.post('/', verifyToken, isTeacher, createJournal);
router.put('/:id', verifyToken, isTeacher, updateJournal);
router.get('/:id', verifyToken, getJournal);
router.get('/', verifyToken, getJournalFeed);
router.delete('/:id', verifyToken, isTeacher, deleteJournal);

export default router;
