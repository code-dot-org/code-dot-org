const LambdaTester = require("lambda-tester");
const AWS = require("aws-sdk");
const sinon = require("sinon");
process.env.ATHENA_DB = "athena_db";
process.env.ATHENA_TABLE = "athena_table";
process.env.ATHENA_OUTPUT = "athena_output";

describe("handler", () => {
  let sandbox;
  let s3;
  let glue;
  let ok = { promise: () => Promise.resolve("OK") };
  beforeEach(done => {
    sandbox = sinon.createSandbox();
    let s3API = {
      copyObject: () => {},
      deleteObject: () => {}
    };
    let glueAPI = {
      getPartition: () => {},
      createPartition: () => {}
    };
    s3 = sandbox.mock(s3API);
    glue = sandbox.mock(glueAPI);
    sandbox.stub(AWS, "S3").returns(s3API);
    sandbox.stub(AWS, "Glue").returns(glueAPI);
    done();
  });
  afterEach(done => {
    sandbox.restore();
    done();
  });

  const filename = "[ID].YYYY-MM-DD-HH.[Hash].gz";
  const bucket = "sourcebucket";
  const prefix = "prefix";

  // Ref: https://docs.aws.amazon.com/lambda/latest/dg/eventsources.html#eventsources-s3-put
  const event = {
    Records: [
      {
        s3: {
          object: { key: `${prefix}/${filename}` },
          bucket: { name: bucket }
        }
      }
    ]
  };

  it("works", () => {
    const myHandler = require("../s3PartitionCloudFrontLog").handler;
    s3.expects("copyObject")
      .withArgs({
        CopySource: `${bucket}/${prefix}/${filename}`,
        Bucket: bucket,
        Key: `cloudfront/${prefix}/year=YYYY/month=MM/day=DD/hour=HH/${filename}`
      })
      .once()
      .returns(ok);
    s3.expects("deleteObject")
      .withArgs({
        Bucket: bucket,
        Key: `${prefix}/${filename}`
      })
      .once()
      .returns(ok);
    glue
      .expects("getPartition")
      .withArgs({
        DatabaseName: process.env.ATHENA_DB,
        TableName: process.env.ATHENA_TABLE,
        PartitionValues: ["YYYY", "MM", "DD", "HH"]
      })
      .once()
      .returns(ok);
    return LambdaTester(myHandler)
      .event(event)
      .expectResult(result => {
        s3.verify();
      });
  });
});
