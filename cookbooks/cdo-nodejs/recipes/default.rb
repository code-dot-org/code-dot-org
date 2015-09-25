#
# Cookbook Name:: cdo-nodejs
# Recipe:: default
#

include_recipe 'nodejs'
nodejs_npm 'npm'
nodejs_npm 'grunt-cli'
