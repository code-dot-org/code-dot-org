include_recipe 'cdo-varnish'
apt_package 'openjdk-7-jre-headless'

require 'etc'
user = Etc.getpwuid.name
home = Etc.getpwuid.dir

remote_file "#{home}/mock.jar" do
  source 'http://repo1.maven.org/maven2/com/github/tomakehurst/wiremock/1.57/wiremock-1.57-standalone.jar'
  backup false
  owner user
end
