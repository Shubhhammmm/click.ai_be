const { S3, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();

const s3 = new S3({
    region: "us-west-1",
    endpoint: `https://s3.us-west-1.amazonaws.com`,
    credentials: {
        accessKeyId: "AKIA5W2ZVTSGM4JQPXGJ",
        secretAccessKey: "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",
    }
});

exports.uploadFileToS3 = async (file) => {
    const params = {
        Bucket: 'demo-bucket-foyr',
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
        Bucket: process.env.AWS_BUCKET_NAME,
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
