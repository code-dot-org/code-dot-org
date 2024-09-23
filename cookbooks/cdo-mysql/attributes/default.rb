default['cdo-mysql'] = {
  proxy: {
    # Enable ProxySQL on non-daemon app-servers by default.
    enabled: node['cdo-apps'] && !node['cdo-apps']['daemon'],
    port: 6033,
    admin: 'mysql2://admin:admin@127.0.0.1:6032',
    # Past Connection Attempt spikes have peaked at about 2 per second per web application server EC2 Instance.
    throttle_connections_per_sec_to_hostgroup: 10
  }
}
default['cdo-secrets'] = {}
