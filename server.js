
const secure = require('server-security');
const express = require('express');
const fileUpload = require('express-fileupload');
const config = require('config');
const db = require('./db');
const mountRoutes = require('./routes');

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());
mountRoutes(app);

secure.createSecureServer(app, config.get('secureServer')).listen(port, () => {
    console.log(`Server running on port ${port}`);
});

process.on('SIGTERM', () => {
    console.info('SIGTERM signal received.');
    server.close(() => {
        console.log('Http server closed.');
    });
    db.closeDbPool();
});