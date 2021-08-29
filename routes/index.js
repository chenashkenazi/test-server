const auth = require('./auth');
const upload = require('./upload');

module.exports = app => {
    app.use('/auth', auth);
    app.use('/upload', upload);
}