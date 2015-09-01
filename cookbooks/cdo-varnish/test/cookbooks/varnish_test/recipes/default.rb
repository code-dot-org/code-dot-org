include_recipe 'cdo-varnish'
apt_package 'openjdk-7-jre-headless'

remote_file '/home/kitchen/mock.jar' do
  source 'http://repo1.maven.org/maven2/com/github/tomakehurst/wiremock/1.57/wiremock-1.57-standalone.jar'
  owner 'kitchen'
  group 'kitchen'
end
