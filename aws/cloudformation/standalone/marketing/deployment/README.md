# Marketing Site Infrastructure

This is a work in progress, and this implementation does not represent the final deploy process we are iterating towards.

## Rendering the CloudFormation templates

The following commands can be used to deploy this CloudFormation stack. It only needs to be deployed once, in the environment containing the "code.org" hosted zone (aka "Prod"). Be sure to insert the hosted zone id on first deploy, after that the final line can be ommitted to reuse the previous value.

```bash
./render.rb marketing --region <aws region> --stage <test|production>
```

This will create the following files:

1. `cloudfront-certificates.yml` - Cloudfront TLS certificates for all marketing stacks.
2. `marketing-[site].yml` - The CloudFormation template for the marketing site partitioned by site.

## STACK: Cloudfront Certificates

This stack creates the TLS certificates for the marketing sites. It is a one-time deploy, and should be run in the environment containing the "code.org" hosted zone (aka "Prod"). The stack will create a certificate for each of the domains listed in the `marketing.yml` file. It can only be deployed to `us-east-1`, hence it being created in a separate stack..

```bash
aws cloudformation deploy \
  --region us-east-1
  --template-file cloudfront-certificates.yml \
  --stack-name marketing-[site]-cloudfront-certificates \
   --parameter-overrides BaseHostedZoneId=<Hosted Zone ID of marketingsites.[base domain]>
```

## STACK: Marketing
To deploy:

```bash
aws cloudformation deploy \
  --template-file marketing-[site].yml \
  --stack-name marketing-[site] \
   --parameter-overrides ContainerImageHashDigest=<lookup on Github Packages> BaseHostedZoneId=<Hosted Zone ID of marketingsites.[base domain]> CloudFrontTLSCertificateArn=<ARN of the TLS Certificate from shared-infra.yml> SubdomainName=<code> BaseDomainName=<marketing-sites.dev-code.org> --capabilities CAPABILITY_NAMED_IAM
```