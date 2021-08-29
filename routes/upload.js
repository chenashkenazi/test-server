const Router = require('express-promise-router');
const router = new Router();
const path = require('path');
const secure = require('server-security');

module.exports = router;

router.post('/', async (req, res, next) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded');
    }

    const uploadPath = path.normalize(__dirname + '/../uploads');

    const files = Object.values(req.files);

    return Promise.all(files.map((file) => secure.validateFileType(file)))
    .then((validTypes) => {
        let promises = [];
        for (let i = 0; i < files.length; i++) {
            if (validTypes[i]) {
                promises.push(moveFile(files[i], uploadPath));
            }
        }
        return Promise.all(promises)
    }).then(() => {
        res.send('Files uploaded successfully');
    })
    .catch((err) => {
        res.send(`some files failed to upload: ${err}`);
    });
})

const moveFile = (file, uploadPath) => {
    return new Promise((resolve, reject) => {
        file.mv(uploadPath + `/${file.name}`, function (err) {
            if (err) {
                reject(err);
            }
            resolve();
        });
    });
}