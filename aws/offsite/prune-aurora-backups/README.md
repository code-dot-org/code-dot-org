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

In order to actually call AWS services during a local run, you'll need to somehow provide credentials ot the container. One way to do this is to provide an aws cli profile name with configured credentials to the invoke command, as shown below. You can also set credentials in your [environment variables](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-envvars.html), which will get picked up by the container.

```bash
sam local invoke PruneAuroraBackupsFunction --event event.json --profile <aws cli profile name>
```

## Deployment

Run the following command to package the Lambda function to S3 and generate the deployment CloudFormation template:

```bash
sam package \
    --profile <aws cli profile name> \
    --output-template-file packaged.yaml \
    --s3-bucket REPLACE_THIS_WITH_YOUR_S3_BUCKET_NAME
```

Next, the following command will create a Cloudformation Stack and deploy your SAM resources. Specify parameters via --parameter-overrides only if required. For updating existing stacks, if a parameter isn't specified, it'll use the existing value.

```bash
sam deploy \
    --profile <aws cli profile name> \
    --template-file packaged.yaml \
    --stack-name prune-aurora-backups \
    --capabilities CAPABILITY_NAMED_IAM \
    --parameter-overrides <parameter name 1>=<parameter value1> ...
```
