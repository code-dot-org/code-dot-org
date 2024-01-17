Runs a script which verifies our offsite database backups once per day.

## Local Development

Test driving with Docker. No local Node install required!

1. Edit "restore-and-verify-backup.js" and any files in "test/"
2. Run `docker compose up` to volume-mount this folder in a container and run Mocha in "--watch" mode.
3. Continue editing files, tests will re-run on save.
4. If you need to edit package.json or other non-js files, run `docker compose build` to refresh your container.

Developing and testing on your workstation.

1. Install Node: `nvm install`
2. Install packages: `npm install`
3. Edit "restore-and-verify-backup.js" and any files in "test/"
4. Run `npm run test` to kick off a test run, or `npm run test-watch` for "--watch" mode.

## Deployment

1. Build the docker image: `docker build -t <your tag> .`
2. Push image to ECR repository named `aurora-verify-backups`, tagged with `latest`
3. Deploy cloudformation stack using template `aurora-verify-backups-stack.yml`
4. See comments at top of `aurora-verify-backups-stack.yml` for remaining manual steps.

To test the whole thing end-to-end, follow these deployment steps to deploy to our dev account.
