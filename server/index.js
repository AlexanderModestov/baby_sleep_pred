require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./database');
const { predictNextSleep } = require('./gemini');

// Debug: Check if environment variables are loaded
console.log('Environment check:');
console.log('GEMINI_API_KEY configured:', process.env.GEMINI_API_KEY ? 'Yes' : 'No');
console.log('GEMINI_API_KEY length:', process.env.GEMINI_API_KEY?.length || 0);
console.log('PORT:', process.env.PORT);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Baby Sleep Tracker API is running' });
});

app.post('/api/users', (req, res) => {
  const { telegram_id, username, first_name } = req.body;
  
  const query = `INSERT OR REPLACE INTO users (telegram_id, username, first_name) VALUES (?, ?, ?)`;
  
  db.run(query, [telegram_id, username, first_name], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ telegram_id, username, first_name });
  });
});

app.get('/api/users/:telegram_id/children', (req, res) => {
  const { telegram_id } = req.params;
  
  const query = `SELECT * FROM children WHERE user_id = ? ORDER BY created_at DESC`;
  
  db.all(query, [telegram_id], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/children', (req, res) => {
  const { user_id, name, birth_date, gender } = req.body;
  
  const query = `INSERT INTO children (user_id, name, birth_date, gender) VALUES (?, ?, ?, ?)`;
  
  db.run(query, [user_id, name, birth_date, gender], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, user_id, name, birth_date, gender });
  });
});

app.put('/api/children/:id', (req, res) => {
  const { id } = req.params;
  const { name, birth_date, gender } = req.body;
  
  const query = `UPDATE children SET name = ?, birth_date = ?, gender = ? WHERE id = ?`;
  
  db.run(query, [name, birth_date, gender, id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id, name, birth_date, gender });
  });
});

app.delete('/api/children/:id', (req, res) => {
  const { id } = req.params;
  
  const query = `DELETE FROM children WHERE id = ?`;
  
  db.run(query, [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Child deleted successfully' });
  });
});

app.post('/api/sleep-sessions', (req, res) => {
  const { child_id, start_time } = req.body;
  
  const query = `INSERT INTO sleep_sessions (child_id, start_time, is_ongoing) VALUES (?, ?, 1)`;
  
  db.run(query, [child_id, start_time], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, child_id, start_time, is_ongoing: true });
  });
});

app.put('/api/sleep-sessions/:id/end', (req, res) => {
  const { id } = req.params;
  const { end_time, quality } = req.body;
  
  const query = `UPDATE sleep_sessions SET end_time = ?, quality = ?, is_ongoing = 0 WHERE id = ?`;
  
  db.run(query, [end_time, quality, id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id, end_time, quality, is_ongoing: false });
  });
});

app.get('/api/children/:child_id/sleep-sessions', (req, res) => {
  const { child_id } = req.params;
  const { limit = 10 } = req.query;
  
  const query = `SELECT * FROM sleep_sessions WHERE child_id = ? ORDER BY start_time DESC LIMIT ?`;
  
  db.all(query, [child_id, limit], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get('/api/children/:child_id/sleep-sessions/ongoing', (req, res) => {
  const { child_id } = req.params;
  
  const query = `SELECT * FROM sleep_sessions WHERE child_id = ? AND is_ongoing = 1 ORDER BY start_time DESC LIMIT 1`;
  
  db.get(query, [child_id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(row || null);
  });
});

app.get('/api/children/:child_id/predict-sleep', async (req, res) => {
  const { child_id } = req.params;
  
  try {
    const childQuery = `SELECT * FROM children WHERE id = ?`;
    const sleepQuery = `SELECT * FROM sleep_sessions WHERE child_id = ? AND end_time IS NOT NULL ORDER BY start_time DESC LIMIT 7`;
    
    db.get(childQuery, [child_id], async (err, child) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      if (!child) {
        res.status(404).json({ error: 'Child not found' });
        return;
      }
      
      db.all(sleepQuery, [child_id], async (err, sleepHistory) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        
        try {
          const prediction = await predictNextSleep(child, sleepHistory);
          res.json(prediction);
        } catch (error) {
          console.error('Prediction error:', error);
          res.status(500).json({ error: 'Failed to generate sleep prediction' });
        }
      });
    });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// For Vercel deployment
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;