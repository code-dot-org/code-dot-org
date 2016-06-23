require 'test_helper'
require 'dynamic_config/loaders/gatekeeper_loader'
require 'dynamic_config/gatekeeper'

class GatekeeperLoaderTest < ActiveSupport::TestCase
  test 'loading a valid gatekeeper yml file' do
    GatekeeperLoader.load("test/fixtures/gatekeeper.yaml")

    assert_equal Gatekeeper.allows?("milestone"), false
    assert_equal Gatekeeper.allows?("milestone", where: { script_id: 38 }), true
    assert_equal Gatekeeper.allows?("milestone", where: { script_id: 40 }), false
  end
  test 'loading an invalid gatekeeper yml file' do
    Gatekeeper.expects(:set).never

    assert_raises do
      GatekeeperLoader.load("test/fixtures/gatekeeper_invalid.yaml")
    end
  end
end
