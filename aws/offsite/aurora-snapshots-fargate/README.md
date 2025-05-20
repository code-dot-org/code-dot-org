Execute a node script which verifies that database backups pushed to our offsite AWS account can be successfully restored and queried, and the Snapshot is a recent backup.

## Development

Install:
`npm install`

Run unit tests:
`npm test`

## Deployment

1. **Configure AWS Client** - ensure local AWS API calls authenticate with credentials that can deploy to the offsite AWS account.
    1. **Create Offsite Profile** - Add an entry to `.aws/config` named `codeorg-offsite` such as
    ```ini
    [profile codeorg-offsite]
    region = my-region-2
    ```
    2. **Configure Credentials** - Add an entry to `.aws/credentials` with API keys provisioned with appropriate Role/Policies
    ```ini
    [codeorg-offsite]
    aws_access_key_id = MYKEYID
    aws_secret_access_key = mysecretkey
    ```
    3. **Switch to Offsite Profile** - Configure the AWS client to default to the offsite profile
    ```bash
    export AWS_PROFILE=codeorg-offsite
    ```
2. **Build Image** - Create a docker image for execution in an AWS ECS Linux/x86 container:

```bash
docker buildx build . --no-cache --platform linux/amd64 --tag [AWS Account ID].dkr.ecr.[AWS Region].amazonaws.com/aurora-verify-backups:[VersionNumber] --tag [AWS Account ID].dkr.ecr.[AWS Region].amazonaws.com/aurora-verify-backups:latest
```

3. **Push Image** -  to ECR repository named `aurora-verify-backups`, tagged with `latest`

```bash
aws ecr get-login-password --region [AWS Region] | docker login --username AWS --password-stdin [AWS Account ID].dkr.ecr.[AWS Region].amazonaws.com
docker push [AWS Account ID].dkr.ecr.[AWS Region].amazonaws.com/aurora-verify-backups --all-tags
```

4. **VPC Stack** - Ensure a VPC and various subnets, securitygroups, etc. [have already been provisioned](https://github.com/code-dot-org/code-dot-org/blob/staging/aws/cloudformation/vpc.yml.erb) in the offsite account:
5. **Deploy Cloudformation Stack** -  using template `aurora-verify-backups-stack.yml` either via the command line or the AWS console
