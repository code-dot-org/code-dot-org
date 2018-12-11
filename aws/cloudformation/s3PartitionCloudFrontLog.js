const AWS = require('aws-sdk');
const s3 = new AWS.S3();

exports.handler = (event, context, callback) => {
  console.log("Request received:\n", JSON.stringify(event));
  process.on('uncaughtException', e=>callback(e));
  const bucket = event.Records[0].s3.bucket.name;
  const key = event.Records[0].s3.object.key;
  const keyFolder = key.split('/');
  const keyFilename = keyFolder.pop();
  // CloudFront log filename format: [ID].YYYY-MM-DD-HH.[Hash].gz
  const partitionNames = ['year', 'month', 'day', 'hour'];
  const partitionPrefix = keyFilename.split('.')[1].split('-').map((v, i) => `${partitionNames[i]}=${v}`).join('/');
  s3.copyObject({
    CopySource: [bucket, key].join('/'),
    Bucket: bucket,
    Key: ['cloudfront', keyFolder.join('/'), partitionPrefix, keyFilename].filter(n => n).join('/')
  }).promise()
    .then((data)=>s3.deleteObject({
      Bucket: bucket,
      Key: key
    }).promise())
    .then((data)=>callback(null))
    .catch((e)=>callback(e));
};
