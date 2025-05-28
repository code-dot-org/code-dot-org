# Marketing Site Continuous Integration / Continuous Deployment Infrastructure

This is a work in progress, and this implementation does not represent the final deploy process we are iterating towards.

## Provision a Marketing Site (a single Stack)

# Prerequisites

The deploy script requires first provisioning a CloudFormationMarketingSites deployer Role and other IAM resources.

# Full usage with all parameters

```bash
./deploy.rb --environment_type test \
            --region us-east-1 \
            --hosted_zone_id ZYX98765421 \
            --base_domain_name marketing-sites.test-code.org \
            --subdomain_name code \
            --container_image_hash sha256:24116f75756f3d80af73d7a2ba43e91ef3d89f0302fea8ece356530360a1b938 \
            --role_arn  arn:aws:iam::123456789:role/admin/CloudFormationMarketingSitesTestRole \
            --web_application_server_secrets_arn arn:aws:secretsmanager:us-east-1:123456789:secret:marketing-sites/test/marketing-sites.test-code.org/code-abc123
```
