include_recipe 'cdo-apps::base'
root = "/home/#{node[:current_user]}/#{node.chef_environment}"
app_root = File.join root, 'dashboard'

require 'etc'
user = Etc.getpwuid(::File.stat(app_root).uid).name rescue node[:current_user]
{
  "#{app_root}/public/blockly" => './apps-package',
  "#{app_root}/public/code-studio" => './code-studio-package',
  "#{app_root}/.bundle" => '../.bundle'
}.each do |from, to|
  link from do
    to to
    user user
    group user
  end
end

execute 'change-permission-tmpdir' do
  command "chown -R #{node[:current_user]}: /tmp/*"
end if node.chef_environment == 'adhoc'

::Chef::Recipe.send(:include, CdoApps)
setup_app 'dashboard'
