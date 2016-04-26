#
# Cookbook Name:: ixgbevf
# Recipe:: ifnames_disable
#
# Copyright (C) 2015 Joe Hohertz, Paytm Labs
#

# Disable for rhel family 7+, debian8+, ubuntu1404+

# Update the setting
execute 'disable ifnames on kernel command line in grub' do
  command "sed -i '/^GRUB\_CMDLINE\_LINUX *=/s/\"$/\ net\.ifnames\=0\"/' /etc/default/grub"
  only_if { 
    (
      ( node['platform_family'] == "rhel" && node['platform_version'].to_f >= 7.0 ) ||
      ( node['platform'] == "debian" && node['platform_version'].to_f >= 8.0 ) ||
      ( node['platform'] == "ubuntu" && node['platform_version'].to_f >= 14.04 )
    ) &&
    !File.readlines("/etc/default/grub").grep(/GRUB_CMDLINE_LINUX *=.*net\.ifnames=0/).any?
  }
  only_if { node['ixgbevf']['disable_ifnames'] }
end

execute 'update grub on debian types' do
  command "update-grub"
  only_if { 
    (
      ( node['platform'] == "debian" && node['platform_version'].to_f >= 8.0 ) ||
      ( node['platform'] == "ubuntu" && node['platform_version'].to_f >= 14.04 )
    ) &&
    !File.readlines("/boot/grub/grub.cfg").grep(/net\.ifnames=0/).any?
  }
  only_if { node['ixgbevf']['disable_ifnames'] }
end

execute 'update grub on rhel types 7+' do
  command "grub2-mkconfig -o /boot/grub2/grub.cfg"
  only_if { node['platform_family'] == "rhel" && node['platform_version'].to_f >= 7.0 }
  only_if { node['ixgbevf']['disable_ifnames'] }
end
