cookbook_file '/etc/gemrc' do
  action :create_if_missing
  source 'gemrc'
  mode '0644'
end

# Update rubygems to a specific version
if node['cdo-ruby']['rubygems_version']
  execute 'gem update --system' do
    command "gem update -q --system '#{node['cdo-ruby']['rubygems_version']}'"
    environment 'REALLY_GEM_UPDATE_SYSTEM' => '1'
    not_if "which gem && gem --version | grep -q '#{node['cdo-ruby']['rubygems_version']}'"
  end
end
