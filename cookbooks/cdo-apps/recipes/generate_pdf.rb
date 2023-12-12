apt_package 'libxss1'

resource_dir = "#{node[:home]}/#{node.chef_environment}/bin/generate-pdf"

# Based on https://github.com/aspyatkin/yarn-cookbook/blob/96ff6eeea7c62167cf9f43659ba5f094223be834/resources/install.rb
execute "execute yarn install at `#{resource_dir}`" do
  command 'yarn install'
  cwd resource_dir
  user node[:current_user]
  group node[:current_user]
  environment(
    'HOME' => node[:home],
    'USER' => node[:current_user]
  )
  action :run
end
