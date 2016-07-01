require_relative 'test_helper'
require 'cdo/rake_utils'
require 'rspec/expectations'
require 'rspec/mocks'

class DeploymentTest < Minitest::Test

  # Use rspec-style mocks in Minitest.
  include ::RSpec::Mocks::ExampleMethods

  def before_setup
    RSpec::Mocks.setup
  end

  def after_teardown
    RSpec::Mocks.verify
  ensure
    RSpec::Mocks.teardown
  end

  # Approximates the parts of the JSON output from `knife search node` that we use.
  KNIFE_SERVERS = {
    results: 2,
    rows: [
      {
        a: {
          cloud_v2: {
            local_hostname: 'host_a'
          }
        }
      },
      {
        b: {
          cloud_v2: {
            local_hostname: 'host_b'
          }
        }
      }
    ]
  }.to_json

  def test_app_servers
    allow(RakeUtils).to receive(:with_bundle_dir){|&blk| blk.call}
    allow(CDO).to receive(:`).and_return(KNIFE_SERVERS)
    allow(CDO).to receive(:chef_managed).and_return(true)

    assert_equal({'a' => 'host_a', 'b' => 'host_b'}, CDO.app_servers)
  end
end
