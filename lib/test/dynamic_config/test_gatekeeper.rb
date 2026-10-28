require_relative '../test_helper'

require 'dynamic_config/gatekeeper'

class DynamicConfigGatekeeperTest < Minitest::Test
  class MockGatekeeper < Gatekeeper
    def self.datastore_cache
      @@mock_datastore_cache ||= Minitest::Mock.new
    end
  end

  MOCK_DATA = {
    'basic feature': {
      "[]" => true
    },
    'empty feature': {},
    'complex feature': {
      "[]" => true,
      "[[\"type\",\"query\"]]" => false
    }
  }.freeze

  def test_allows
    MockGatekeeper.datastore_cache.expect(:get, {"[]" => true}, ["test"])
    assert MockGatekeeper.allows("test")

    MockGatekeeper.datastore_cache.expect(:get, {"[]" => false}, ["test"])
    refute MockGatekeeper.allows("test")

    MockGatekeeper.datastore_cache.expect(:get, {"[[\"type\",\"query\"]]" => true}, ["test"])
    assert MockGatekeeper.allows("test", where: {type: "query"})

    MockGatekeeper.datastore_cache.expect(:get, {"[[\"type\",\"query\"]]" => false}, ["test"])
    refute MockGatekeeper.allows("test", where: {type: "query"})

    MockGatekeeper.datastore_cache.verify
  end

  def test_basic_setter_functionality
    assert_raises ArgumentError do
      MockGatekeeper.set("valid key", "non-boolean value")
    end

    MockGatekeeper.stubs(:get_rule_map).returns({})

    MockGatekeeper.datastore_cache.expect(:set, true, ["valid key", {"[]" => true}])
    assert MockGatekeeper.set("valid key", value: true)

    MockGatekeeper.datastore_cache.expect(:set, true, ["valid key", {"[]" => true, "[[\"type\",\"query\"]]" => true}])
    assert MockGatekeeper.set("valid key", value: true, where: {type: "query"})

    MockGatekeeper.datastore_cache.verify
    MockGatekeeper.unstub(:get_rule_map)
  end

  def test_delete
    assert_raises ArgumentError do
      MockGatekeeper.delete(:invalid_key, where: {})
    end

    MockGatekeeper.stubs(:get_rule_map).returns({"[[\"type\",\"query\"]]" => true})

    refute MockGatekeeper.delete("nonexistent key")
    refute MockGatekeeper.delete("valid key", where: {"nonexistent type" => "query"})
    refute MockGatekeeper.delete("valid key", where: {"type" => "nonexistent query"})

    MockGatekeeper.datastore_cache.expect(:set, true, ["valid key", {}])
    assert MockGatekeeper.delete("valid key", where: {"type" => "query"})

    MockGatekeeper.datastore_cache.verify
    MockGatekeeper.unstub(:get_rule_map)
  end

  def test_where_key
    assert_equal "[]", MockGatekeeper.where_key({})

    assert_equal "[[\"script_name\",\"Test Script\"]]",
      MockGatekeeper.where_key({script_name: "Test Script"})

    assert_equal "[[\"lesson_name\",\"Test Lesson\"],[\"script_name\",\"Test Script\"]]",
      MockGatekeeper.where_key({script_name: "Test Script", lesson_name: "Test Lesson"})
  end

  def test_to_hash
    MockGatekeeper.datastore_cache.expect(:all, MOCK_DATA)
    expected = {
      'basic feature': [{"rule" => nil, "value" => true}],
      'empty feature': [],
      'complex feature': [
        {"rule" => nil, "value" => true},
        {"rule" => nil, "where" => {"type" => "query"}, "value" => false}
      ]
    }
    assert_equal(expected, MockGatekeeper.to_hash)
    MockGatekeeper.datastore_cache.verify
  end

  def test_feature_names
    MockGatekeeper.datastore_cache.expect(:all, MOCK_DATA)
    assert_equal(Set[:'basic feature', :'complex feature'], MockGatekeeper.feature_names)
    MockGatekeeper.datastore_cache.verify
  end

  def test_property_values
    MockGatekeeper.datastore_cache.expect(:all, MOCK_DATA)
    assert_equal(Set[], MockGatekeeper.property_values(""))

    MockGatekeeper.datastore_cache.expect(:all, MOCK_DATA)
    assert_equal(Set["query"], MockGatekeeper.property_values("type"))

    MockGatekeeper.datastore_cache.verify
  end
end
