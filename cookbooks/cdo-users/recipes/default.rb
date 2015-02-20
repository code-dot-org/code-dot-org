#
# Cookbook Name:: cdo-users
# Recipe:: default
#

require 'chef/user'

node['cdo-users'].each_pair do |user_name, user_data|
  home_directory = user_data['home'] || "/home/#{user_name}"

  user user_name do
    home home_directory
    comment user_data['comment']
    shell user_data['shell'] || '/bin/bash'
  end
  
  group user_name do
    members user_name
  end
  
  directory home_directory do
    owner user_name
    group user_name
  end

  ssh_directory = File.join(home_directory, '.ssh')
  directory ssh_directory do
    owner user_name
    group user_name
    mode '0711'
  end

  {
    'authorized_keys' => user_data['ssh-key'],
    'id_rsa' => node['cdo-servers']['ssh-private-key'],
    'id_rsa.pub' => node['cdo-servers']['ssh-key'],
  }.each_pair do |file, text|
    template File.join(ssh_directory, file) do
      source 'text_file.erb'
      variables( text:text )
      owner user_name
      group user_name
      mode '0600'
    end
  end
  
  if user_data['email']
    template File.join(home_directory, '.forward') do
      action :create_if_missing
      source 'forward.erb'
      variables( email:user_data['email'].strip.downcase )
      owner user_name
      group user_name
    end
  end
  
  [
    '.bash_logout',
    '.bashrc',
    '.inputrc',
    '.profile',
  ].each do |dotfile|
    template File.join(home_directory, "#{dotfile}") do
      action :create_if_missing
      source "#{dotfile[1..-1]}.erb"
      #variables( )
      owner user_name
      group user_name
    end
  end
  
end
