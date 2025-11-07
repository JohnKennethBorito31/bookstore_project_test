const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const DATA_DIR = path.join(__dirname, 'data');
const BOOKS_FILE = path.join(DATA_DIR, 'books.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const JWT_SECRET = 'replace_this_with_a_real_secret_in_production';

// Helpers to read/write JSON
function readJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}
function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Public routes

// Get all books
app.get('/books', (req, res) => {
  const books = readJSON(BOOKS_FILE);
  res.json(books);
});

// Get book by ISBN
app.get('/books/isbn/:isbn', (req, res) => {
  const { isbn } = req.params;
  const books = readJSON(BOOKS_FILE);
  const book = books.find(b => b.isbn === isbn);
  if (!book) return res.status(404).json({ error: 'Book not found' });
  res.json(book);
});

// Get books by author (case-insensitive substring match)
app.get('/books/author/:author', (req, res) => {
  const { author } = req.params;
  const books = readJSON(BOOKS_FILE);
  const filtered = books.filter(b => b.author.toLowerCase().includes(author.toLowerCase()));
  res.json(filtered);
});

// Get books by title (case-insensitive substring match)
app.get('/books/title/:title', (req, res) => {
  const { title } = req.params;
  const books = readJSON(BOOKS_FILE);
  const filtered = books.filter(b => b.title.toLowerCase().includes(title.toLowerCase()));
  res.json(filtered);
});

// Get book reviews
app.get('/books/:isbn/review', (req, res) => {
  const { isbn } = req.params;
  const books = readJSON(BOOKS_FILE);
  const book = books.find(b => b.isbn === isbn);
  if (!book) return res.status(404).json({ error: 'Book not found' });
  res.json(book.reviews || {});
});

// Register new user
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'username & password required' });
  const users = readJSON(USERS_FILE);
  if (users.find(u => u.username === username)) return res.status(409).json({ error: 'User already exists' });
  const salt = bcrypt.genSaltSync(8);
  const hash = bcrypt.hashSync(password, salt);
  users.push({ username, password: hash });
  writeJSON(USERS_FILE, users);
  res.status(201).json({ message: 'User registered' });
});

// Login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const users = readJSON(USERS_FILE);
  const user = users.find(u => u.username === username);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = bcrypt.compareSync(password, user.password);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '2h' });
  res.json({ token });
});

// Auth middleware
function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Missing authorization header' });
  const parts = header.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ error: 'Invalid authorization format' });
  const token = parts[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Add/Modify a book review (protected)
app.post('/auth/review/:isbn', authMiddleware, (req, res) => {
  const { isbn } = req.params;
  const { review } = req.body;
  if (typeof review !== 'string') return res.status(400).json({ error: 'review text required' });
  const books = readJSON(BOOKS_FILE);
  const book = books.find(b => b.isbn === isbn);
  if (!book) return res.status(404).json({ error: 'Book not found' });
  if (!book.reviews) book.reviews = {};
  book.reviews[req.user.username] = review;
  writeJSON(BOOKS_FILE, books);
  res.json({ message: 'Review added/updated', reviews: book.reviews });
});

// Delete review by that user (protected)
app.delete('/auth/review/:isbn', authMiddleware, (req, res) => {
  const { isbn } = req.params;
  const books = readJSON(BOOKS_FILE);
  const book = books.find(b => b.isbn === isbn);
  if (!book) return res.status(404).json({ error: 'Book not found' });
  if (!book.reviews || !book.reviews[req.user.username]) {
    return res.status(404).json({ error: 'Review by this user not found' });
  }
  delete book.reviews[req.user.username];
  writeJSON(BOOKS_FILE, books);
  res.json({ message: 'Review deleted', reviews: book.reviews });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Bookstore API listening on port ${PORT}`);
});
