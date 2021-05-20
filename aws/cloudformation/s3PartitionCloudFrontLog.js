const AWS = require("aws-sdk");
const s3 = new AWS.S3();
const glue = new AWS.Glue();

const inputFormat = "org.apache.hadoop.mapred.TextInputFormat";
const outputFormat = "org.apache.hadoop.hive.ql.io.HiveIgnoreKeyTextOutputFormat";
const serdeInfo = {
  Name: "LazySimpleSerde",
  SerializationLibrary: "org.apache.hadoop.hive.serde2.lazy.LazySimpleSerDe",
  Parameters: {
    "field.delim": "\t",
    "serialization.format": "\t"
  }
};

const createdPartitions = {};

exports.handler = (event, context, callback) => {
  console.log("Request received:\n", JSON.stringify(event));
  process.on('uncaughtException', e => callback(e));
  function result(e) {
    if (event.Records) {return null;}
    return {
      invocationSchemaVersion: event.invocationSchemaVersion,
      treatMissingKeysAs: 'PermanentFailure',
      invocationId: event.invocationId,
      results: [{
      taskId: event.tasks[0].taskId,
      resultCode: e ? 'TemporaryFailure' : 'Succeeded',
      resultString: e ? e.toString() : 'OK'
    }]
    }
  }

  let bucket, key;
  if (event.Records) {
    bucket = event.Records[0].s3.bucket.name;
    key = event.Records[0].s3.object.key;
  } else {
    bucket = event.tasks[0].s3BucketArn.split(':').pop();
    key = event.tasks[0].s3Key;
  }
  const keyFolder = key.split("/").map(n => n.replace(/-tmp$/, ''));
  const keyFilename = keyFolder.pop();
  // CloudFront log filename format: [ID].YYYY-MM-DD-HH.[Hash].gz
  const partitionNames = ['year', 'month', 'day', 'hour'];
  const date = keyFilename.split('.')[1].split('-');
  const partitionPrefix = date.map((v, i) => `${partitionNames[i]}=${v}`).join('/');
  const destinationBase = ['cloudfront', keyFolder.join('/'), partitionPrefix].filter(n => n).join('/');
  const destinationKey = [destinationBase, keyFilename].join('/');
  const partitionLocation = `s3://${bucket}/${destinationBase}`;
  s3.copyObject({
    CopySource: [bucket, key].join('/'),
    Bucket: bucket,
    Key: destinationKey
  }).promise()
    .catch((e) => {if (e.code !== 'NoSuchKey') {throw e;}})
    .then((_)=>s3.deleteObject({
      Bucket: bucket,
      Key: key
    }).promise())
    .catch((e) => {if (e.code !== 'NoSuchKey') {throw e;}})
    .then((_)=> {
      if (event.tasks || createdPartitions[date.join()]) {return;}
      return glue.getPartition({
        DatabaseName: process.env.ATHENA_DB,
        TableName: process.env.ATHENA_TABLE,
        PartitionValues: date
      }).promise().catch((e)=>{
        if (e.code === 'EntityNotFoundException') {
          return glue.createPartition({
            DatabaseName: process.env.ATHENA_DB,
            TableName: process.env.ATHENA_TABLE,
            PartitionInput: {
              Values: date,
              StorageDescriptor: {
                Location: partitionLocation,
                InputFormat: inputFormat,
                OutputFormat: outputFormat,
                SerdeInfo: serdeInfo
              }
            }
          }).promise().catch((e)=> {if (e.code !== 'AlreadyExistsException') {throw e;}});
        } else { throw e; }
      }).then((_)=>createdPartitions[date.join()] = true);
    })
    .then((_)=>callback(null, result(null)))
    .catch((e)=>callback(e, result(e)));
};
