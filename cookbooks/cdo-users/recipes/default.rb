#
# Cookbook Name:: cdo-users
# Recipe:: default
#

require 'chef/user'
require 'chef/client'

chef_gem("aws-sdk-ec2") {compile_time true}
require 'aws-sdk-ec2'

apt_package 'awscli' # AWS command-line tools
apt_package 'emacs'
apt_package 'zsh'

#
# For each user defined in cdo-users, ensure there is a basic home folder.
#
node['cdo-users'].each_pair do |user_name, user_data|
  home_directory = user_data['home'] || "/home/#{user_name}"
  aws_config = user_data['cdo-awscli'] || node['cdo-awscli']

  # Create the user's account.
  user user_name do
    home home_directory
    comment user_data['comment']
    shell user_data['shell'] || '/bin/bash'
  end

  # Create the user's group
  group user_name do
    members user_name
  end

  # Create the user's home directory
  directory home_directory do
    owner user_name
    group user_name
  end

  # The basics
  [
    '.bash_logout',
    '.bashrc',
    '.inputrc',
    '.profile',
  ].each do |dotfile|
    template File.join(home_directory, dotfile) do
      action :create_if_missing
      source "#{dotfile[1..-1]}.erb"
      #variables( )
      owner user_name
      group user_name
    end
  end

  # Forward email if an address is provided
  template File.join(home_directory, '.forward') do
    not_if user_data['email'].nil?
    action :create_if_missing
    source 'forward.erb'
    variables(email: user_data['email'].strip.downcase)
    owner user_name
    group user_name
  end

  #
  #
  # Configure SSH
  #
  #

  ssh_directory = File.join(home_directory, '.ssh')
  directory ssh_directory do
    owner user_name
    group user_name
    mode '0711'
  end

  {
    'authorized_keys' => user_data['ssh-key'],
    'server_access_key' => node['cdo-servers']['ssh-private-key'],
    'server_access_key.pub' => node['cdo-servers']['ssh-key'],
    'drone_access_key' => node['cdo-servers']['drone-ssh-private-key'],
  }.each_pair do |file, text|
    template File.join(ssh_directory, file) do
      source 'text_file.erb'
      variables(text: text)
      owner user_name
      group user_name
      mode '0600'
    end
  end

  # ssh-able hosts should include both those servers managed as Chef nodes and
  # those servers that exist only as EC2 instances. In case of a naming
  # conflict, we allow Chef to win.
  hosts = {}
  unless aws_config.nil?
    Aws::EC2::Client.new(
      region: aws_config['region'] || "us-east-1",
      credentials: Aws::Credentials.new(
        aws_config['access_key_id'],
        aws_config['access_key_secret']
      )
    ).describe_instances(filters: [{name: 'instance-state-name', values: ['running']}]).
      reservations.map(&:instances).flatten.each do |instance|
      next if instance.private_dns_name.nil? || instance.private_dns_name.empty?

      name = instance.tags.find {|tag| tag.key == "Name"}
      next unless name && name.value

      # SSH requires that hostnames consist of zero or more non-whitespace
      # characters, with optional wildcards:
      # http://man.openbsd.org/OpenBSD-current/man5/ssh_config.5#PATTERNS
      next unless name.value =~ /^\S*$/

      hosts[name.value] = instance.private_dns_name
    end
  end
  search(:node, "*:*").each do |node|
    hosts[node.name] = node['cloud'] ? node['cloud']['local_hostname'] : node['fqdn'] || 'fqdn_missing'
  end
  template File.join(ssh_directory, 'config') do
    #action :create_if_missing
    source 'ssh_config.erb'
    variables(hosts: hosts)
    owner user_name
    group user_name
    mode '0600'
  end

  #
  #
  # Configure the AWS command-line tools
  #
  #

  unless aws_config.nil?
    aws_directory = File.join(home_directory, '.aws')
    directory aws_directory do
      owner user_name
      group user_name
      mode '0711'
    end

    template File.join(aws_directory, 'config') do
      source 'aws_config.erb'
      variables(config: aws_config)
      owner user_name
      group user_name
      mode '0600'
    end
  end

  #
  #
  # Configure CHEF
  #
  #

  chef_directory = File.join(home_directory, '.chef')
  directory chef_directory do
    owner user_name
    group user_name
  end

  template File.join(chef_directory, 'knife.rb') do
    source 'chef_knife.rb.erb'
    variables(chef_user_name: user_data['chef-user'])
    owner user_name
    group user_name
    mode '0600'
  end
end

# Create the user's group
group 'chef' do
  members node['cdo-users'].keys
end

file '/etc/chef/validation.pem' do
  group 'chef'
  mode '0660'
end
