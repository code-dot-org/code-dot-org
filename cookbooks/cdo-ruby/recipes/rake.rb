# Install rake
gem_package 'rake' do
  action :upgrade
  version node['cdo-ruby']['rake_version']
end
