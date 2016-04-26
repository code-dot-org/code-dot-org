case node['nodejs']['engine']
when 'node'
  case node['platform_family']
  when 'debian'
    default['nodejs']['install_repo'] = true

    default['nodejs']['repo']      = 'https://deb.nodesource.com/node'
    default['nodejs']['keyserver'] = 'keyserver.ubuntu.com'
    default['nodejs']['key']       = '1655a0ab68576280'
  when 'rhel'
    default['nodejs']['install_repo'] = true
  end
when 'iojs'
  case node['platform_family']
  when 'debian'
    default['nodejs']['install_repo'] = true

    default['nodejs']['repo']      = 'https://deb.nodesource.com/iojs_2.x'
    default['nodejs']['keyserver'] = 'keyserver.ubuntu.com'
    default['nodejs']['key']       = '1655a0ab68576280'
  end
end
