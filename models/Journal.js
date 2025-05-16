import db from '../db/index.js';

class Journal { 
  static async create(teacherId, description, publishedAt, attachmentType = null, attachmentUrl = null) {
    const query = `
      INSERT INTO journals (teacher_id, description, published_at, attachment_type, attachment_url) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING id, teacher_id, description, published_at, attachment_type, attachment_url, created_at
    `;
    const values = [teacherId, description, publishedAt, attachmentType, attachmentUrl];
    const result = await db.query(query, values);
    return result.rows[0]
  }

  static async update(id, description, publishedAt, attachmentType = null, attachmentUrl = null) {
    const query = `
      UPDATE journals 
      SET description = $1, published_at = $2, attachment_type = $3, attachment_url = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING id, teacher_id, description, published_at, attachment_type, attachment_url, created_at, updated_at
    `;
    const values = [description, publishedAt, attachmentType, attachmentUrl, id];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    // First delete all student tagged to the journal 
    await db.query('DELETE FROM journal_students WHERE journal_id = $1', [id]);
    
    const query = 'DELETE FROM journals WHERE id = $1 RETURNING id';
    const result = await db.query(query, [id]);
    return result.rows[0]
  }

  static async findById(id) {
    const query = `
      SELECT j.*, 
      (SELECT json_agg(u.username) FROM journal_students js JOIN users u ON js.student_id = u.id WHERE js.journal_id = j.id) as student_usernames,
      (SELECT json_agg(json_build_object('id', u.id, 'username', u.username)) FROM journal_students js JOIN users u ON js.student_id = u.id WHERE js.journal_id = j.id) as students
      FROM journals j
      WHERE j.id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0]
  }

  static async findByTeacherId(teacherId) {
    const query = `
      SELECT j.*, 
      (SELECT json_agg(u.username) FROM journal_students js JOIN users u ON js.student_id = u.id WHERE js.journal_id = j.id) as student_usernames,
      (SELECT json_agg(json_build_object('id', u.id, 'username', u.username)) FROM journal_students js JOIN users u ON js.student_id = u.id WHERE js.journal_id = j.id) as students
      FROM journals j
      WHERE j.teacher_id = $1
      GROUP BY j.id
      ORDER BY j.published_at DESC
    `;
    const result = await db.query(query, [teacherId]);
    return result.rows;
  }

  static async findByStudentId(studentId, currentTime) {
    const query = `
      SELECT j.*, 
      (SELECT json_agg(u.username) FROM journal_students js JOIN users u ON js.student_id = u.id WHERE js.journal_id = j.id) as student_usernames,
      (SELECT json_agg(json_build_object('id', u.id, 'username', u.username)) FROM journal_students js JOIN users u ON js.student_id = u.id WHERE js.journal_id = j.id) as students,
      (SELECT json_build_object('id', u.id, 'username', u.username) FROM users u WHERE u.id = j.teacher_id) as teacher
      FROM journals j
      JOIN journal_students js ON j.id = js.journal_id
      WHERE js.student_id = $1 AND j.published_at <= $2
      GROUP BY j.id
      ORDER BY j.published_at DESC
    `;
    const result = await db.query(query, [studentId, currentTime]);
    return result.rows;
  }

  static async tagStudentsByUsernames(journalId, studentUsernames) {
    // Clear previous tags
    await db.query('DELETE FROM journal_students WHERE journal_id = $1', [journalId]);
    
    // No students to tag
    if (!studentUsernames || studentUsernames.length === 0) {
      return [];
    }

    // Get student id from usernames
    const placeholders = studentUsernames.map((_, i) => `$${i + 1}`).join(', ');
    const userQuery = `SELECT id FROM users WHERE username IN (${placeholders}) AND role = 'student'`;
    const userResult = await db.query(userQuery, studentUsernames);
    
    if (userResult.rows.length === 0) {
      return [];
    }
    
    // insert new tags
    const studentIds = userResult.rows.map(row => row.id);
    const values = studentIds.map(studentId => `(${journalId}, ${studentId})`).join(', ');
    const query = `
      INSERT INTO journal_students (journal_id, student_id)
      VALUES ${values}
      RETURNING journal_id, student_id
    `;
    const result = await db.query(query);
    return result.rows;
  }
}

export default Journal;

