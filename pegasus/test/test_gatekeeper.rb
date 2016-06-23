require_relative '../src/env'
require 'minitest/autorun'
require 'dynamic_config/gatekeeper'

class GatekeeperTest < Minitest::Test
  def test_gatekeeper_works_in_pegasus
    # Most of gatekeepers tests are in dashboard
    # make sure it will load and work in pegasus.
    Gatekeeper.set("fake", value: true)
    assert_equal Gatekeeper.allows?("fake"), true
  end
end
