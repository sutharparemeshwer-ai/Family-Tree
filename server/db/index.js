const { Pool } = require('pg');

const pool = new Pool({
  user: 'parm',
  host: 'localhost',
  database: 'family_tree_db',
  password: 'a1rtp2er',
  port: 5432,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
};
