# Marketing Site Continuous Integration / Continuous Deployment Infrastructure

This is a work in progress, and this implementation does not represent the final deploy process we are iterating towards.

## Provision a Marketing Site (a single Stack)

# Basic usage with required parameters

./deploy.rb --hosted_zone_id Z1234567890ABCD \
--container_image_hash sha256:abc123def456 \
--wait

# Full usage with all parameters

./deploy.rb --environment_type production \
--region us-west-2 \
--hosted_zone_id Z1234567890ABCD \
--base_domain_name marketing-sites.prod-code.org \
--subdomain_name hourofcode \
--container_image_hash sha256:abc123def456 \
--wait

```

```
