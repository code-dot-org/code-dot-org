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

1. **Configure AWS Client** - ensure local AWS API calls authenticate with credentials that can deploy to the offsite AWS account.
    1. **Create Offsite Profile** - Add an entry to `.aws/config` named `codeorg-offsite` such as
      ```
        [profile codeorg-offsite]
        region = my-region-2
      ```
   2. **Configure Credentials** - Add an entry to `.aws/credentials` with API keys provisioned with appropriate Role/Policies
     ```
       [codeorg-offsite]
        aws_access_key_id = MYKEYID
        aws_secret_access_key = mysecretkey
     ```
   3. **Switch to Offsite Profile** - Configure the AWS client to default to the offsite profile
    ``` bash
      export AWS_PROFILE=codeorg-offsite
    ```
2. **Package the serverless function** - 
Run the following command to package the Lambda function to S3 and generate the deployment CloudFormation template:
`.`
```bash
sam package \
    --profile codeorg-offsite \
    --output-template-file prune-aurora-backups.packaged.yaml \
    --s3-bucket my-cloudformation-template-bucket
```

3. **Deploy/Update the Serverless Function**

```bash
sam deploy \
    --profile codeorg-offsite \
    --template-file prune-aurora-backups.packaged.yaml \
    --stack-name prune-aurora-backups \
    --capabilities CAPABILITY_NAMED_IAM
```
