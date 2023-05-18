# Installs Google Chrome for Linux.

# Official Google Chrome debian/ubuntu repo.
# https://www.google.com/linuxrepositories/
apt_repository 'google-chrome' do
  arch         'amd64'
  uri          'http://dl.google.com/linux/chrome/deb'
  distribution 'stable'
  components   %w(main)
  key          'https://dl-ssl.google.com/linux/linux_signing_key.pub'
  retries 3
end

apt_package 'google-chrome-stable' do
  # Pin to a specific version so that all our servers work the same. In
  # particular, staging and test having different versions here can result in
  # unexpected differences building the apps package.
  version '113.0.5672.126-1'
end
