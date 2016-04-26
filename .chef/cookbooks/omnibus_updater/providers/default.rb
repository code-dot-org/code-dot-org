def whyrun_supported?
  true
end

use_inline_resources
include Chef::DSL::IncludeRecipe

action :update do
  node.set[:omnibus_updater][:version] = @new_resource.version
  include_recipe 'omnibus_updater::default'
end
