git '/tmp/tippecanoe' do
  repository 'https://github.com/mapbox/tippecanoe.git'
  revision '1.34.3'
end

execute 'make' do
  cwd '/tmp/tippecanoe'
end

execute 'make install' do
  cwd '/tmp/tippecanoe'
  environment({'PREFIX' => '/usr/local'})
end
