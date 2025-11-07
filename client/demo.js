/**
 * Client demo to exercise the four required methods using Axios.
 * - getAllBooksAsyncCallback: async function that accepts a callback
 * - searchByISBNPromises: uses Promises (.then/.catch)
 * - searchByAuthorAsyncAwait: uses async/await
 * - searchByTitleAsyncAwait: uses async/await
 *
 * Ensure server is running at http://localhost:3000
 */
const axios = require('axios');

const BASE = 'http://localhost:3000';

// 1) Async callback-style function (returns via callback)
async function getAllBooksAsyncCallback(callback) {
  try {
    const res = await axios.get(`${BASE}/books`);
    // simulate callback-style by calling provided callback
    callback(null, res.data);
  } catch (err) {
    callback(err);
  }
}

// 2) Search by ISBN using Promises
function searchByISBNPromises(isbn) {
  return axios.get(`${BASE}/books/isbn/${isbn}`)
    .then(res => res.data)
    .catch(err => { throw err.response ? err.response.data : err; });
}

// 3) Search by Author using async/await
async function searchByAuthorAsyncAwait(author) {
  const res = await axios.get(`${BASE}/books/author/${encodeURIComponent(author)}`);
  return res.data;
}

// 4) Search by Title using async/await
async function searchByTitleAsyncAwait(title) {
  const res = await axios.get(`${BASE}/books/title/${encodeURIComponent(title)}`);
  return res.data;
}

// Demo runner
async function runDemo() {
  console.log('--- Demo start ---');

  // 1
  await new Promise(resolve => {
    getAllBooksAsyncCallback((err, books) => {
      if (err) {
        console.error('Callback getAllBooks error:', err.message || err);
      } else {
        console.log('getAllBooks (callback) count:', books.length);
      }
      resolve();
    });
  });

  // 2
  try {
    const book = await searchByISBNPromises('9780143127741');
    console.log('searchByISBN (promises) title:', book.title);
  } catch (err) {
    console.error('searchByISBN error:', err);
  }

  // 3
  try {
    const byAuthor = await searchByAuthorAsyncAwait('Daniel Kahneman');
    console.log('searchByAuthor (async/await) count:', byAuthor.length);
  } catch (err) {
    console.error('searchByAuthor error:', err);
  }

  // 4
  try {
    const byTitle = await searchByTitleAsyncAwait('Alchemist');
    console.log('searchByTitle (async/await) count:', byTitle.length);
  } catch (err) {
    console.error('searchByTitle error:', err);
  }

  console.log('--- Demo end ---');
}

runDemo();
