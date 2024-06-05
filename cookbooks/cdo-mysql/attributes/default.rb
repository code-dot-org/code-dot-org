default['cdo-mysql'] = {
  target_version: '5.7',
  proxy: {
    # Enable ProxySQL on non-daemon app-servers by default.
    enabled: node['cdo-apps'] && !node['cdo-apps']['daemon'],
    port: 6033,
    reporting_port: 6034,
    admin: 'mysql2://admin:admin@127.0.0.1:6032'
  }
}
default['cdo-secrets'] = {}
