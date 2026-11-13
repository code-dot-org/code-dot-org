adhoc = node.chef_environment == 'adhoc'

default['cdo-repository'] = {
  # GitHub owner/name. Production deploys from code-dot-org/code-dot-org-production;
  # see docs/specs/private-production-deploy.md.
  repo: 'code-dot-org/code-dot-org',
  # Sync to the default branch based on the environment.
  branch: adhoc ? 'staging' : node.chef_environment,
  # Shallow clone.
  depth: 1
}
