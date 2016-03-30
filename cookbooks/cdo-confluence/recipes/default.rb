node.normal['confluence']['version'] = node['cdo-confluence']['version']
hostname node['cdo-confluence']['hostname'] if node['cdo-confluence']['hostname']
include_recipe 'confluence'
