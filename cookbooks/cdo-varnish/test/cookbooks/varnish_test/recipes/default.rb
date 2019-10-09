include_recipe 'cdo-varnish'
apt_package 'openjdk-11-jdk-headless'

require 'etc'
user = Etc.getpwuid.name
home = Etc.getpwuid.dir

remote_file "#{home}/mock.jar" do
  source 'http://repo1.maven.org/maven2/com/github/tomakehurst/wiremock-standalone/2.25.0/wiremock-standalone-2.25.0.jar'
  backup false
  owner user
end

# Set up file(s) served by wiremock in tests.
directory "#{home}/__files" do
  owner user
  group user
end
template "#{home}/__files/fakepdf.pdf" do
  source 'fakepdf.pdf.erb'
  backup false
  owner user
end
