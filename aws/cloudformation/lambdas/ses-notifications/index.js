// These dependencies are all standard Node.js libraries or AWS SDK's available in
// lambdas without needing to be installed separately.
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');

const s3 = new S3Client({ region: process.env.AWS_REGION });

exports.handler = async (event, context) => {
    const bucket = process.env.S3_BUCKET;
    const prefix = process.env.S3_PREFIX;
    
    for (const record of event.Records) {
        // Parse SNS message
        const snsMessage = JSON.parse(record.Sns.Message);
        
        // Create partition based on date and hour (Athena-optimized)
        const now = new Date();
        const year = now.getUTCFullYear();
        const month = String(now.getUTCMonth() + 1).padStart(2, '0');
        const day = String(now.getUTCDate()).padStart(2, '0');
        const hour = String(now.getUTCHours()).padStart(2, '0');
        const partition = `year=${year}/month=${month}/day=${day}/hour=${hour}`;
        
        // Generate timestamped filename
        const timestamp = now.toISOString().replace(/[:.]/g, '-');
        const filename = `${timestamp}_${uuidv4()}.json`;
        
        // S3 key
        const s3Key = `${prefix}/${partition}/${filename}`;
        
        // Store to S3
        const command = new PutObjectCommand({
            Bucket: bucket,
            Key: s3Key,
            Body: JSON.stringify(snsMessage, null, 2),
            ContentType: 'application/json'
        });
        
        await s3.send(command);
    }
    
    return { statusCode: 200 };
};
