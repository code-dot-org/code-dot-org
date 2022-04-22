require_relative '../test_helper'

require 'dynamic_config/dynamic_config_base'

class DynamicConfigBaseTest < Minitest::Test
  def setup
    @mock_datastore = MiniTest::Mock.new
    @dynamic_config = DynamicConfigBase.new(@mock_datastore)
  end

  def test_basic_setter_functionality
    @mock_datastore.expect(:set, true, ["valid key", "first value"])
    assert @dynamic_config.set("valid key", "first value")

    assert_raises ArgumentError do
      @dynamic_config.set(:invalid_key, "second value")
    end

    @mock_datastore.verify
  end

  def test_basic_getter_functionality
    @mock_datastore.expect(:get, "value", ["valid key"])
    assert_equal @dynamic_config.get("valid key", "default"), "value"

    assert_raises ArgumentError do
      @dynamic_config.get(:invalid_key)
    end

    @mock_datastore.verify
  end

  def test_get_default_logic
    @mock_datastore.expect(:get, nil, ["nil key"])
    @mock_datastore.expect(:get, "nonnil value", ["nonnil key"])
    assert_equal @dynamic_config.get("nil key", "default value"), "default value"
    assert_equal @dynamic_config.get("nonnil key", "default value"), "nonnil value"
    @mock_datastore.verify
  end
end
