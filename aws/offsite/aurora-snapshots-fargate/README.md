Runs a script which verifies our offiste database backups once per day.

## Deployment

1. Build the docker image for execution in an AWS ECS Linux/x86 container:

``` bash
docker buildx build . --no-cache --platform linux/amd64 --tag [AWS Account ID].dkr.ecr.[AWS Region].amazonaws.com/aurora-verify-backups:[VersionNumber] --tag [AWS Account ID].dkr.ecr.[AWS Region].amazonaws.com/aurora-verify-backups:latest
```

2. Push image to ECR repository named `aurora-verify-backups`, tagged with `latest`

``` bash
aws ecr get-login-password --region [AWS Region] | docker login --username AWS --password-stdin [AWS Account ID].dkr.ecr.[AWS Region].amazonaws.com`
docker push [AWS Account ID].dkr.ecr.[AWS Region].amazonaws.com/aurora-verify-backups --all-tags
```


3. Deploy cloudformation stack using template `aurora-verify-backups-stack.yml` (Ensure template is updated to reference the correct image tag)

4. See comments at top of `aurora-verify-backups-stack.yml` for remaining manual steps.

## Development

Install:
`npm install`

Run unit tests:
`npm test`

To run the whole thing end-to-end, follow deployment steps to deploy to our dev account.