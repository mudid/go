const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: 'root',
  database: 'GO',
  port: 3306
});

// 保存笔记
app.post('/api/notes', async (req, res) => {
  try {
    const { content } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO notes (content) VALUES (?)',
      [content]
    );
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 搜索笔记
app.get('/api/notes/search', async (req, res) => {
  try {
    const { keyword } = req.query;
    const [rows] = await pool.execute(
      'SELECT * FROM notes WHERE content LIKE ? ORDER BY created_at DESC',
      [`%${keyword}%`]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 添加删除笔记的API
app.delete('/api/notes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute(
      'DELETE FROM notes WHERE id = ?',
      [id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
}); 