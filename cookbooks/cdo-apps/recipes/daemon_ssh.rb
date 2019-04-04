# Install server_access_key and SSH config on daemon server
# for SSH access to frontends.

{
  server_access_key: node['cdo-servers']['ssh-private-key'],
  'server_access_key.pub' => node['cdo-servers']['ssh-key'],
}.each_pair do |file, text|
  file "#{node[:home]}/.ssh/#{file}" do
    content text
    user node[:current_user]
    group node[:current_user]
    mode 0o600
  end
end

ssh_config = <<SSH_CONFIG
Host github.com
  StrictHostKeyChecking no
Host *.ec2.internal *.cdn-code.org
  User ubuntu
  StrictHostKeyChecking no
  PreferredAuthentications publickey
  IdentityFile ~/.ssh/server_access_key
SSH_CONFIG

file "#{node[:home]}/.ssh/config" do
  content ssh_config
  user node[:current_user]
  group node[:current_user]
  mode 0o600
end
