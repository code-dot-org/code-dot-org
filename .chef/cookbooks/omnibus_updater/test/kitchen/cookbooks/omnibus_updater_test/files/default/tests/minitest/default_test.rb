require 'minitest/spec'
require 'open-uri'

describe_recipe 'omnibus_updater_test::default' do
  include MiniTest::Chef::Assertions

  it "sets remote package location" do
    assert(node[:omnibus_updater][:full_url], "Failed to set URI for omnibus package")
  end

  it "does downloads the package to the node" do
    file("/opt/#{File.basename(node[:omnibus_updater][:full_url])}").must_exist
  end
end
