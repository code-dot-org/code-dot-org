# Load deployment.rb into Chef context.
# This makes CDO.* variables and secrets available to Chef resources in the execution phase.
#
# To resolve a reference in the execution phase use `#lazy in a Chef-resource property, e.g.:
#
# resource do
#   property lazy {CDO.variable_name}
# end

# Install gem dependencies used by Cdo::Secrets.
chef_gem 'aws-sdk-secretsmanager'
chef_gem 'activesupport'

ruby_block 'CDO config' do
  block do
    ENV['BUNDLE_GEMFILE'] = '' # Disable Bundler
    require "#{node['cdo-repository']['git_path']}/deployment"
  end
end
