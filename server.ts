import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';

const db = new Database('database.sqlite');

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    type TEXT,
    amount REAL,
    category TEXT,
    date TEXT,
    km REAL
  );

  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    data TEXT
  );
`);

const app = express();
app.use(express.json());
const PORT = 3000;

// API Routes
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.set('Surrogate-Control', 'no-store');
  next();
});

app.get('/api/transactions', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM transactions ORDER BY date DESC');
    const transactions = stmt.all();
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

app.post('/api/transactions', (req, res) => {
  try {
    const { id, type, amount, category, date, km } = req.body;
    const stmt = db.prepare('INSERT INTO transactions (id, type, amount, category, date, km) VALUES (?, ?, ?, ?, ?, ?)');
    stmt.run(id, type, amount, category, date, km || null);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add transaction' });
  }
});

app.delete('/api/transactions/:id', (req, res) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare('DELETE FROM transactions WHERE id = ?');
    stmt.run(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

app.get('/api/settings', (req, res) => {
  try {
    const stmt = db.prepare('SELECT data FROM settings WHERE id = 1');
    const result = stmt.get() as { data: string } | undefined;
    if (result) {
      res.json(JSON.parse(result.data));
    } else {
      res.json(null);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

app.post('/api/settings', (req, res) => {
  try {
    const data = JSON.stringify(req.body);
    const stmt = db.prepare('INSERT INTO settings (id, data) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET data = excluded.data');
    stmt.run(data);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
