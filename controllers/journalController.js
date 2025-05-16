import Journal from '../models/Journal.js';
import User from '../models/User.js';

// creation
export const createJournal = async (req, res) => {
  try {
    const { description, publishedAt, attachmentType, attachmentUrl, studentUsernames } = req.body;
    const teacherId = req.user.id;
    
    const user = await User.findById(teacherId);
    if (user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can create journals' });
    }
    
    if (!description || !publishedAt) {
      return res.status(400).json({ message: 'Description and publishedAt are required' });
    }
      
    if (attachmentType && !['image', 'video', 'url', 'pdf'].includes(attachmentType)) {
      return res.status(400).json({ message: 'Invalid attachment type' });
    }
    
    const journal = await Journal.create(
      teacherId,
      description,
      new Date(publishedAt),
      attachmentType,
      attachmentUrl
    );
    
    // tagging students
    if (studentUsernames && studentUsernames.length > 0) {
      await Journal.tagStudentsByUsernames(journal.id, studentUsernames);
    }
    
    // Get the full journal with students
    const fullJournal = await Journal.findById(journal.id);
    
    res.status(201).json({
      message: 'Journal created successfully',
      journal: fullJournal
    });
  } catch (error) {
    console.error('Journal creation error:', error);
    res.status(500).json({ message: 'Server error during journal creation' })
  } };

//Updation 
export const updateJournal = async (req, res) => {
  try {
    const { id } = req.params
    const { description, publishedAt, attachmentType, attachmentUrl, studentUsernames } = req.body;
    const teacherId = req.user.id
    
    // Role - only techer
    const user = await User.findById(teacherId);
    if (user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can update journals' })
    }
    
    // Scope of the teacher for updation
    const existingJournal = await Journal.findById(id)
    if (!existingJournal) {
      return res.status(404).json({ message: 'Journal not found' })
    }
    
    if (existingJournal.teacher_id !== teacherId) {
      return res.status(403).json({ message: 'You can only update your own journals' })
    }
    
    if (!description || !publishedAt) {
      return res.status(400).json({ message: 'Description and publishedAt are required' });
    }
    
    if (attachmentType && !['image','video', 'url', 'pdf'].includes(attachmentType)) {
      return res.status(400).json({ message: 'Attatchment not supported!!' });
    }
    
    // Update journal
    const journal = await Journal.update(
      id,
      description,
      new Date(publishedAt),
      attachmentType,
      attachmentUrl
    )
    
    // Update student tags
    if (studentUsernames) {
      await Journal.tagStudentsByUsernames(journal.id, studentUsernames);
    }
    
    // get the full updated journal with students
    const fullJournal = await Journal.findById(journal.id)
    
    res.json({
      message: 'Journal updated successfully',
      journal: fullJournal
    });
  } catch (error) {
    console.error('Journal update error:', error)
    res.status(500).json({ message: 'Server error during journal update' });
  } };

// delete journal
export const deleteJournal = async (req, res) => {
  try {
    const { id } = req.params;
    const teacherId = req.user.id;
    
    // Role should be teacher
    const user = await User.findById(teacherId);
    if (user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can delete journals' });
    }
    
    // Scope of the teacher
    const existingJournal = await Journal.findById(id);
    if (!existingJournal) {
      return res.status(404).json({ message: 'Journal not found' });
    }
    
    if (existingJournal.teacher_id !== teacherId) {
      return res.status(403).json({ message: 'You can only delete your own journals' });
    }
    
    // Delete journal
    await Journal.delete(id);
    
    res.json({
      message: 'Journal deleted successfully',
      id
    });
  } catch (error) {
    console.error('Journal deletion error:', error);
    res.status(500).json({ message: 'Server error during journal deletion' });
  }
};

// get journal by id
export const getJournal = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id
    const user = await User.findById(userId)

    const journal = await Journal.findById(id)

    if (!journal) {
      return res.status(404).json({ message: 'Journal not found' });
    }
    
    if (user.role === 'teacher') {
      if (journal.teacher_id !== userId) {
        return res.status(403).json({ message: 'Access denied' })
      }
    } else {
      // Students can only view journals they are tagged in and that are at a time greater than published_at
      const studentUsernames = journal.student_usernames || [];
      const isTagged = studentUsernames.includes(user.username)
      const isPublished = new Date(journal.published_at) <= new Date();
      
      if (!isTagged || !isPublished) {
        return res.status(403).json({ message: 'Access denied' })
      }
    }
    
    res.json({ journal })
  } catch (error) {
    console.error('Journal retrieval error:', error)
    res.status(500).json({ message: 'Server error during journal retrieval' });
  }
};

// get all journal
export const getJournalFeed = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId)
    
    let journals = [];
    
    if (user.role === 'teacher') {
      journals = await Journal.findByTeacherId(userId)
    } else {
      const currentTime = new Date();
      journals = await Journal.findByStudentId(userId, currentTime)
    }
    
    res.json({ journals });
  } catch (error) {
    console.error('Journal feed error:', error);
    res.status(500).json({ message: 'Server error during journal feed retrieval' });
  }};

