include_recipe 'cdo-apps::base'
root = "/home/#{node[:current_user]}/#{node.chef_environment}"
app_root = File.join root, 'dashboard'

require 'etc'
user = Etc.getpwuid(::File.stat(app_root).uid).name
{
  "#{app_root}/public/blockly" => './apps-package',
  "#{app_root}/public/shared" => './shared-package',
  "#{app_root}/public/code-studio" => './code-studio-package',
  "#{app_root}/.bundle" => '../.bundle'
}.each do |from, to|
  link from do
    to to
    user user
    group user
  end
end

::Chef::Recipe.send(:include, CdoApps)
setup_app 'dashboard'
