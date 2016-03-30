default['mysql'] = {
  server_root_password: 'changeit'
}
default['cdo-confluence'] = {
  version: '5.6.5'
}
default['cdo-confluence']['hostname'] = node['ec2']['public_hostname'] if node['ec2'] && node['ec2']['public_hostname']
default['apache']['listen_ports'] = []
