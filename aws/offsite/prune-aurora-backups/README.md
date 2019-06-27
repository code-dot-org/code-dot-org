# prune-aurora-backups

## Requirements

* AWS CLI
* [SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)
* [NodeJS 10.10+](https://nodejs.org/en/download/releases/)
* Docker

## Development

**Install**

`npm install`

**Run unit tests**

`npm test`

**Invoking function locally in a docker container using a local sample payload**

TODO: figure out best way to set up AWS credentials when running locally

```bash
sam local invoke HelloWorldFunction --event event.json
```

## Deployment

Run the following command to package the Lambda function to S3 and generate the deployment CloudFormation template:

```bash
sam package \
    --output-template-file packaged.yaml \
    --s3-bucket REPLACE_THIS_WITH_YOUR_S3_BUCKET_NAME
```

Next, the following command will create a Cloudformation Stack and deploy your SAM resources.

```bash
sam deploy \
    --template-file packaged.yaml \
    --stack-name prune-aurora-backups \
    --capabilities CAPABILITY_NAMED_IAM
```
