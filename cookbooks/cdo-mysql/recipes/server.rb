apt_package 'mysql-server-5.6'
service 'mysql' do
  action [:enable, :start]
end
node.override['cdo-apps']['local_mysql'] = true if node['cdo-apps']
