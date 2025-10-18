const pool = require('../../config/database');

class NoteService {
  // Get all notes
  async getAllNotes() {
    const query = 'SELECT * FROM sap_notes ORDER BY created_at DESC';
    const result = await pool.query(query);
    return result.rows;
  }

  // Get note by ID
  async getNoteById(id) {
    const query = 'SELECT * FROM sap_notes WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Create note
  async createNote(noteData) {
    const { noteId, system, owner, status = 'pending' } = noteData;
    const query = `
      INSERT INTO sap_notes (note_id, system, owner, status)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await pool.query(query, [noteId, system, owner, status]);
    return result.rows[0];
  }

  // Update note
  async updateNote(id, noteData) {
    const { status } = noteData;
    const query = `
      UPDATE sap_notes 
      SET status = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2 
      RETURNING *
    `;
    const result = await pool.query(query, [status, id]);
    return result.rows[0];
  }

  // Delete note
  async deleteNote(id) {
    const query = 'DELETE FROM sap_notes WHERE id = $1';
    await pool.query(query, [id]);
  }
}

module.exports = new NoteService();
