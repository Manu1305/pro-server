const { PutObjectCommand, S3Client } = require('@aws-sdk/client-s3');
const dotenv = require("dotenv");
const { v4: uuidv4 } = require('uuid');
dotenv.config({ path: "../config/env" });

const client = new S3Client({});



const BUCKET = process.env.BUCKRT_NAME

const uploadToAWS = async ({ file, productId }) => {
    const Key = uuidv4()
    const command = new PutObjectCommand({
        Bucket: BUCKET,
        Key,
        Body: file.buffer,
        ContentType: file.mimetype
    });

    try {
        const response = await client.send(command);
        // console.log(response);
        return { response }
    } catch (err) {
        // console.error(err);
        return { error: err }
    }
};


module.exports = uploadToAWS