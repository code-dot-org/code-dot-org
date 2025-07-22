# Marketing Site Continuous Integration / Continuous Deployment Infrastructure

## Prerequisites

1. Execute `1-setup/deploy.rb` (as AWS admin) to create Global resources (`per-account.yml.erb` and `per-region.yml.erb`) that support all Marketing Sites deployed to the current AWS Account and Region. This defaults to setting up Region resources in `us-east-1`. Use `setup.rb --region [region id]` to prepare a different Region to support Marketing Sites.
1. Create an AWS Secrets Manager Secret in the same Account and Region where the marketing site Stack will be provisioned and with the naming convention `marketing-sites/[environment type]/[base domain name of the marketing site]/[subdomain of the site]` and populate it with the following keys
   - CONTENTFUL_DELIVERY_TOKEN
   - CONTENTFUL_PREVIEW_TOKEN
   - CONTENTFUL_REVALIDATE_TOKEN
   - DRAFT_MODE_TOKEN
   - STATSIG_CLIENT_KEY
   - STATSIG_SERVER_KEY
   - OTEL_EXPORTER_OTLP_HEADERS

## Provision a Marketing Site CloudFormation Stack

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
