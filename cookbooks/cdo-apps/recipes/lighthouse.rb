# Installs Lighthouse npm package and Google Chrome dependency.

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

apt_package 'google-chrome-stable'
nodejs_npm 'lighthouse'
