# cdo-users

Creates a login account for each entry in `node['cdo-users']`.

The entries are not in this repo. They are node attributes held on the Chef
Infra Server, so adding a user is an edit there, not a commit
here. The cookbook defines no defaults.

For each `user_name => user_data` pair the recipe creates:

- the user and a group of the same name, with home directory `user_data['home']`
  (default `/home/<user_name>`) and shell `user_data['shell']` (default
  `/bin/bash`);
- `.bashrc`, `.bash_logout`, `.inputrc` and `.profile`, written only if absent;
- `.forward`, if `user_data['email']` is set;
- `.ssh/authorized_keys` from `user_data['ssh-key']`;
- `.ssh/server_access_key{,.pub}` and `.ssh/drone_access_key`, the shared
  keys from `node['cdo-servers']`;
- `.ssh/config`, listing every Chef node and, when AWS credentials are
  configured, every running EC2 instance with a `Name` tag;
- `.aws/config`, from `user_data['cdo-awscli']` or else `node['cdo-awscli']`;
- `.chef/knife.rb`, naming `user_data['chef-user']` as the knife client.

All listed users are made members of the `chef` group, which has group
read/write on `/etc/chef/validation.pem`.

A user removed from `node['cdo-users']` is not deleted from the host.
