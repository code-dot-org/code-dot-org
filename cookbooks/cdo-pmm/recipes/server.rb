docker_image 'percona/pmm-server' do
  tag 'latest'
  action :pull
  notifies :redeploy, 'docker_container[pmm_server]'
end

docker_container 'pmm_data' do
  repo 'percona/pmm-server'
  tag 'latest'
  volumes %w(
    /opt/prometheus/data
    /opt/consul-data
    /var/lib/mysql
    /var/lib/grafana
  )
  command 'true'
  action :create
end

docker_container 'pmm_server' do
  repo 'percona/pmm-server'
  tag 'latest'
  port "#{node['cdo-pmm']['server']['port_forward']}:80" if node['cdo-pmm']['server']['port_forward']
  volumes_from 'pmm_data'
  network_mode node['cdo-pmm']['server']['network_mode']
  restart_policy 'always'
  env ['DISABLE_TELEMETRY=true']
end
