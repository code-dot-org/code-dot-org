include_recipe 'cdo-apps::base'
root = "/home/#{node[:current_user]}/#{node.chef_environment}"
app_root = File.join root, 'dashboard'

{
  "#{app_root}/public/blockly" => '#./public/apps-package',
  "#{app_root}/public/shared" => '#./public/shared-package',
  "#{app_root}/public/code-studio" => './code-studio-package',
  "#{app_root}/.bundle" => '../.bundle'
}.each do |from, to|
  link from do
    to to
    action :create
    user node[:current_user]
    group node[:current_user]
  end
end

::Chef::Recipe.send(:include, CdoApps)
setup_app 'dashboard'
