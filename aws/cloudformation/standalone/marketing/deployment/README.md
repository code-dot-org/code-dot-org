# Marketing Site Infrastructure

This is a work in progress, and this implementation does not represent the final deploy process we are iterating towards.

## STACK: contentful-integration

The following commands can be used to deploy this CloudFormation stack. It only needs to be deployed once, in the environment containing the "code.org" hosted zone (aka "Prod"). Be sure to insert the hosted zone id on first deploy, after that the final line can be ommitted to reuse the previous value.

```bash
./deploy.rb contentful-integration
aws cloudformation deploy \
  --template-file contentful-integration.yml \
  --stack-name contentful-integration \
  --parameter-overrides CodeDotOrgHostedZoneId=<hosted-zone-id>
```

## STACK: marketing

TBD, but similarly to the above you can render the template via `./deploy.rb marketing`
