
default['ixgbevf']['version'] = "3.1.2"
default['ixgbevf']['checksum'] = "845f37a16a5acc491b5e6bdf6d3fe580724d82b7cf88ac080e3c8f9ceeea79ee"
default['ixgbevf']['package'] = "ixgbevf-#{node['ixgbevf']['version']}.tar.gz"
default['ixgbevf']['package_url'] = "http://sourceforge.net/projects/e1000/files/ixgbevf stable/#{node['ixgbevf']['version']}/#{node['ixgbevf']['package']}"
default['ixgbevf']['dir']     = "/usr/src/ixgbevf-#{node['ixgbevf']['version']}"
default['ixgbevf']['module_flags'] = "InterruptThrottleRate=1,1,1,1,1,1,1,1"
default['ixgbevf']['disable_ifnames'] = false
default['ixgbevf']['compile_time'] = true

case node['platform']
  when 'ubuntu'
    if node['platform_version'].to_f >= 14.04
      default['ixgbevf']['disable_ifnames'] = true
    end
  when 'debian'
    if node['platform_version'].to_f >= 8.0
      default['ixgbevf']['disable_ifnames'] = true
    end
  when 'centos', 'rhel'
    if node['platform_version'].to_f >= 7.0
      default['ixgbevf']['disable_ifnames'] = true
    end
end

