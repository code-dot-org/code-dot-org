include_recipe 'cdo-apps::base'
root = "/home/#{node[:current_user]}/#{node.chef_environment}"
app_root = File.join root, 'dashboard'

{
  "#{app_root}/public/blockly" => "#{app_root}/public/apps-package",
  "#{app_root}/public/shared" => "#{app_root}/public/shared-package",
  "#{app_root}/public/code-studio" => "#{app_root}/public/code-studio-package",
  "#{app_root}/.bundle" => "#{root}/.bundle"
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
