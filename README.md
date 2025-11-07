# Bookstore Project

This is a sample Node.js Bookstore project implementing the assignment tasks.

## Features
- Public endpoints:
  - `GET /books` - List all books
  - `GET /books/isbn/:isbn` - Get book by ISBN
  - `GET /books/author/:author` - Get books by author
  - `GET /books/title/:title` - Get books by title
  - `GET /books/:isbn/review` - Get reviews for a book
  - `POST /register` - Register new user
  - `POST /login` - Login and receive a JWT

- Protected endpoints (require `Authorization: Bearer <token>`):
  - `POST /auth/review/:isbn` - Add/modify review for ISBN (by logged-in user)
  - `DELETE /auth/review/:isbn` - Delete your review for ISBN

## Client scripts (in `client/`) demonstrate 4 methods using Axios:
- `client/demo.js` runs four example methods:
  - Async callback-style function to get all books
  - Promises-based search by ISBN
  - Async/Await search by Author
  - Async/Await search by Title

## Run
1. Install dependencies:
   ```
   npm install
   ```
2. Start the server:
   ```
   npm start
   ```
3. In another terminal, run the client demo:
   ```
   npm run client-demo
   ```

Data files are in `data/` (books.json and users.json). This repo is ready to zip and submit.

