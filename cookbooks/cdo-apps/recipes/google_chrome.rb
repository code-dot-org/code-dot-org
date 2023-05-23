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
  #
  # This should be at least close to the version we target in browsers.json:
  # https://github.com/code-dot-org/code-dot-org/blob/7c2530fc6f2f8115c5c0cfdbbda2538211493d6f/dashboard/test/ui/browsers.json#L7
  version '113.0.5672.126-1'
end
