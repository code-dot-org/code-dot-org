# Install redis from package by default.
node.default['redisio']['package_install'] = true
node.default['redisio']['version'] = nil
node.default['redisio']['bin_path'] = '/usr/bin'

include_recipe 'redisio'
include_recipe 'redisio::enable'
