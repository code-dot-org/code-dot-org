# Install Java dependency
# https://support.crowdin.com/cli-tool/#requirements
include_recipe 'cdo-java-7'

# Add crowdin debian repository, based on instructions provided at
# https://support.crowdin.com/cli-tool/#debian
apt_repository 'crowdin' do
  uri "https://artifacts.crowdin.com/repo/deb/"
  components ["/"]
  key "https://artifacts.crowdin.com/repo/GPG-KEY-crowdin"
end

# Install crowdin cli
apt_package 'crowdin'
