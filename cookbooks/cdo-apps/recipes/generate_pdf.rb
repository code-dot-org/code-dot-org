apt_package 'libxss1'

yarn_install "#{node[:home]}/#{node.chef_environment}/bin/generate-pdf" do
  user node[:current_user]
  action :run
end
