const mysql = require("mysql");
const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'mysql',
    user: 'root',
    password: '1q2w3e4r!!',
    database: 'myapp'
});

exports.pool = pool;
