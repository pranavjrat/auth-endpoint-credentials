import pg from 'pg';
import { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } from '../config.js';

const { Pool } = pg;

const pool = new Pool({
  port: DB_PORT,
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
});

const db = {
  query: (text, params) => pool.query(text, params),
  // one time setup
  connect: async () => {
    const client = await pool.connect();

    // User Table 
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL, 
        role VARCHAR(20) NOT NULL CHECK (role IN ('teacher', 'student')), 
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`);

    // Journal
    await client.query(`
      CREATE TABLE IF NOT EXISTS journals (
        id SERIAL PRIMARY KEY,
        teacher_id INTEGER NOT NULL REFERENCES users(id),
        description TEXT NOT NULL,
        published_at TIMESTAMP NOT NULL,
        attachment_type VARCHAR(20) CHECK (attachment_type IN (NULL, 'image','video', 'url', 'pdf')),
        attachment_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`);

    // Tagging students
    await client.query(`
      CREATE TABLE IF NOT EXISTS journal_students (
        journal_id INTEGER REFERENCES journals(id) ,
        student_id INTEGER REFERENCES users(id),
        PRIMARY KEY (journal_id, student_id)
      )`);

    client.release();
    console.log('Db connected and tables initialized');
    return true;
  } 
};

export default db;
