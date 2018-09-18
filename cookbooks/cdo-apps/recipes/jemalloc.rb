include_recipe 'cdo-jemalloc'

%w(dashboard pegasus).each do |app|
  node.default['cdo-apps'][app]['env']['LD_PRELOAD'] = node['cdo-jemalloc']['lib']
  malloc_conf = node['cdo-jemalloc']['malloc_conf'].map {|x| x.join(':')}.join(',')
  node.default['cdo-apps'][app]['env']['MALLOC_CONF'] = malloc_conf
end
