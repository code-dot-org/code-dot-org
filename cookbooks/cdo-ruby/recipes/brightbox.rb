# Installs Ruby using the Ubuntu PPA maintained by Brightbox.
# https://www.brightbox.com/docs/ruby/ubuntu/

include_recipe 'apt'

apt_repository 'brightbox-ruby-ng' do
  uri 'ppa:brightbox/ruby-ng'
  distribution node['lsb']['codename']
end

ruby_version = node['cdo-ruby']['version']
packages = %W(
  build-essential
  ruby#{ruby_version}
  ruby#{ruby_version}-dev
)
packages.each do |name|
  apt_package name do
    action :upgrade
  end
end

cookbook_file '/etc/gemrc' do
  action :create_if_missing
  source 'gemrc'
  mode '0644'
end

# Update rubygems to a specific version
rubygems_version = node['cdo-ruby']['rubygems_version']
if rubygems_version
  execute 'gem update --system' do
    command "gem update -q --system '#{rubygems_version}'"
    environment 'REALLY_GEM_UPDATE_SYSTEM' => '1'
    not_if "which gem && gem --version | grep -q '#{rubygems_version}'"
  end
end
