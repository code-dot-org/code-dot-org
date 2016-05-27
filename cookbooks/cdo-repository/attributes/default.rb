adhoc = node.chef_environment == 'adhoc'

default['cdo-repository'] = {
  url: 'https://github.com/code-dot-org/code-dot-org.git',
  # Sync to the default branch based on the environment.
  branch: adhoc ? 'staging' : node.chef_environment,
  # Shallow clone for adhoc environment.
  depth: adhoc ? 1 : nil
}
