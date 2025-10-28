# Marketing Site Build & Deployment Infrastructure

## Pre-Requisite - Provision Global and Region Resources

Execute a script (`cicd/1-setup/setup.rb`) that creates the Stack `marketing-sites-global-resources` in the current AWS Account and
`marketing-sites-region-resources` in the current Region to support provisioning one or more Marketing Sites in the current
Account and Region. This setup script must be re-run once per AWS Account anytime `MarketingSites::Configuration` module
in `config.rb` or when `account-resources.yml.erb` is modified. Must be re-run once per Region when
`region-resources.yml.erb` is modified

1. Assume an AWS Role that has **admin permissions** in the AWS Account: `export AWS_PROFILE=codeorg-admin`
1. Find or Create an S3 bucket in the current Region to store rendered CloudFormation templates: `cf-templates-1a2b3c4d5e6f-us-east-1`
1. Execute the setup script:

- `./setup.rb --template-bucket cf-templates-1a2b3c4d5e6f # Default to us-east-1`
- `./setup.rb --region us-east-2 --template-bucket cf-templates-1a2b3c4d5e6f # Explicitly specify a Region`

## Provision a Marketing Site CloudFormation Stack

1. Configure Stack-specific Passwords/Keys/Settings

   1. Configure an AWS Secrets Manager Secret in the same Account and Region where the marketing site Stack will be provisioned
      and with the naming convention:

      `marketing-sites/[environment type]/[base domain name of the marketing site]/[subdomain of the site]`

   1. Populate the secret with the following keys:
      - CONTENTFUL_DELIVERY_TOKEN
      - CONTENTFUL_PREVIEW_TOKEN
      - CONTENTFUL_REVALIDATE_TOKEN
      - DRAFT_MODE_TOKEN
      - STATSIG_CLIENT_KEY
      - STATSIG_SERVER_KEY
      - OTEL_EXPORTER_OTLP_HEADERS

1. Assume an AWS Role that had permissions to create most types of Resources (must be admin for environment_type=production):
   `export AWS_PROFILE=cdo`
1. Execute Site Deployment Script

```bash
cd 3-app
./deploy.rb --environment_type development \
            --region my-region-2 \
            --hosted_zone_id ZYX98765421 \
            --base_domain_name marketing-sites.dev-code.org \
            --subdomain_name code \
            --container_image_hash sha256:24116f75756f3d80af73d7a2ba43e91ef3d89f0302fea8ece356530360a1b938 \
            --role_arn  arn:aws:iam::123456789:role/admin/CloudFormationMarketingSitesDevelopmentRole \
            --web_application_server_secrets_arn arn:aws:secretsmanager:my-region-2:123456789:secret:marketing-sites/development/marketing-sites.dev-code.org/code-abc123 \
            --cloudformation_role_boundary arn:aws:iam::123456789:policy/marketing-sites-role-permissions-boundary-development
```
