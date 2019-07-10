Runs a script which verifies our offiste database backups once per day.

## Deployment

1. Build the docker image:
`docker build -t <your tag> .`

2. Push image to ECR repository named `aurora-verify-backups`, tagged with `latest`

3. Deploy cloudformation stack using template `aurora-verify-backups-stack.yml`

4. See comments at top of `aurora-verify-backups-stack.yml` for remaining manual steps.

## Development

Install:
`npm install`

Run unit tests:
`npm test`

To run the whole thing end-to-end, follow deployment steps to deploy to our dev account.