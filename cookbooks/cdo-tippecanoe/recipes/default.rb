apt_package %w(build-essential libsqlite3-dev zlib1g-dev)

ark 'tippecanoe' do
  url 'https://github.com/mapbox/tippecanoe/archive/1.34.3.tar.gz'
  checksum '7a2dd2376a93d66a82c8253a46dbfcab3eaaaaca7bf503388167b9ee251bee54'
  action :install_with_make
end
