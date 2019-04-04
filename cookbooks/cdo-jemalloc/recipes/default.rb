include_recipe 'ark'

url = 'https://github.com/jemalloc/jemalloc/releases/download'
version = node['cdo-jemalloc']['version']

ark 'jemalloc' do
  url "#{url}/#{version}/#{name}-#{version}.tar.bz2"
  checksum node['cdo-jemalloc']['checksum']
  action :install_with_make
end
