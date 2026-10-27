require_relative '../test_helper'

require 'dynamic_config/dynamic_config_base'

class DynamicConfigBaseTest < Minitest::Test
  class MockDynamicConfig < DynamicConfigBase
    def self.datastore_cache
      @@mock_datastore_cache ||= Minitest::Mock.new
    end
  end

  def test_basic_setter_functionality
    MockDynamicConfig.datastore_cache.expect(:set, true, ["valid key", "first value"])
    assert MockDynamicConfig.set("valid key", "first value")

    assert_raises ArgumentError do
      MockDynamicConfig.set(:invalid_key, "second value")
    end

    MockDynamicConfig.datastore_cache.verify
  end

  def test_basic_getter_functionality
    MockDynamicConfig.datastore_cache.expect(:get, "value", ["valid key"])
    assert_equal MockDynamicConfig.get("valid key", "default"), "value"

    assert_raises ArgumentError do
      MockDynamicConfig.get(:invalid_key)
    end

    MockDynamicConfig.datastore_cache.verify
  end

  def test_get_default_logic
    MockDynamicConfig.datastore_cache.expect(:get, nil, ["nil key"])
    MockDynamicConfig.datastore_cache.expect(:get, "nonnil value", ["nonnil key"])
    assert_equal MockDynamicConfig.get("nil key", "default value"), "default value"
    assert_equal MockDynamicConfig.get("nonnil key", "default value"), "nonnil value"
    MockDynamicConfig.datastore_cache.verify
  end
end
