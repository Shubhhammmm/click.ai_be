const { S3, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();

const s3 = new S3({
    region: process.env.AWSREGION,
    endpoint: `https://s3.us-west-1.amazonaws.com`,
    credentials: {
        accessKeyId: process.env.AWSKEY,
        secretAccessKey: process.env.AWSSECRET,
    }
});

exports.uploadFileToS3 = async (file) => {
    const params = {
        Bucket: process.env.AWSBUCKET,
        Key: file.originalname,
        Body: file.buffer,
        ContentType: file.mimetype,
    };


    try {
        const command = new PutObjectCommand(params);
        const response = await s3.send(command);  
        
        return response;
    } catch (err) {
        console.error('Error uploading file to S3:', err);
        throw new Error(`Upload failed: ${err.message}`); 
    }
};

exports.deleteFileFromS3 = async (fileKey) => {
    const params = {
        Bucket: process.env.AWSBUCKET,
        Key: fileKey, 
    };

    console.log('Deleting file with params:', params);

    try {
        const command = new DeleteObjectCommand(params);
        const response = await s3.send(command);
        console.log('File deleted successfully:', response);
        return response; 
    } catch (err) {
        console.error('Error deleting file from S3:', err);
        throw new Error(`Delete failed: ${err.message}`); 
    }
};
