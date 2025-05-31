require('dotenv').config();
const fs = require('fs');
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

async function uploadToS3(filePath, fileName) {
    const fileContent = fs.readFileSync(filePath);

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileName,
        Body: fileContent,
        ContentType: 'application/pdf',
    };

    const uploadResult = await s3.upload(params).promise();
    return uploadResult.Location; // public URL
}

module.exports = uploadToS3;
