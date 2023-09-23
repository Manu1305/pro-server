const AWS = require("@aws-sdk/client-s3")
const dotenv = require("dotenv");
const multerS3 = require('multer-s3')
const multer = require('multer')
dotenv.config({ path: "../config/env" });


// create instance
const s3 = new AWS.S3({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRETE_KEY,
        region: process.env.REGION
    },
});


// send images to cloud through multer
const uploadThroughMulter = () => multer({
    storage: multerS3({
        s3,
        bucket: process.env.BUCKRT_NAME_PROD,
        // acl:'public-read',
        metadata: function (req, file, cb) {
            // console.log("FILES",file)
            cb(null, { fieldname: file.fieldname })
        },
        key: function (req, file, cb) {
            cb(null, file.originalname)
        }
    })
});


// module.exports = {uploadThroughMulter}


const uploadToAWS = (req, res) => {

    console.log("Received files: ", req.files)
    const upload = uploadThroughMulter();

    upload(req, res, err => {

        console.log("Received files: ", req.files)
        if (err) {
            console.log(err);
            res.json({ err, message: "error while uploading to cloud" });
            return
        };

        res.json({ message: "uploaded successfully", files: req.files })
    });
}

module.exports = uploadThroughMulter



