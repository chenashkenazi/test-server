const { Pool } = require('pg');
const pool = new Pool();

module.exports = {
    closeDbPool: () => pool.end(() => console.log('pool has ended')),
    query: (text, params) => pool.query(text, params),
}