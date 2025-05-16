import db from '../db/index.js';

class User {
  static async create(username, password, role) {
    const query = `
      INSERT INTO users (username, password, role) 
      VALUES ($1, $2, $3) 
      RETURNING id, username, role
    `;
    const values = [username, password, role];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async findByUsername(username) {
    const query = 'SELECT * FROM users WHERE username = $1';
    const values = [username];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT * FROM users WHERE id = $1';
    const values = [id];
    const result = await db.query(query, values);
    return result.rows[0];
  }
}

export default User;
