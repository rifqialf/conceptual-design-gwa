const { Pool } = require("pg");

      const pool = new Pool({
            user: "userName",
            host: "127.0.0.1",
            database: "database",
            password: "myPassword",
            port: 3000,
            });
module.exports = { pool };