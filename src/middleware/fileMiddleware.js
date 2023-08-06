const multer = require('multer');
const path = require('path');
const fs = require('fs')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = './uploads'
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }

        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {

        const ext = path.extname(file.originalname);
        cb(null, Date.now() + ext);
    }
})

const filterFiles = function (req, file, cb) {
    if (
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/gif'
    ) {
        cb(null, true);
    } else {
        cb(new Error('Only JPEG, PNG and GIF images are allowed'))
    }
};

const upload = multer({ storage: storage, filterFile: filterFiles })

module.exports = upload;