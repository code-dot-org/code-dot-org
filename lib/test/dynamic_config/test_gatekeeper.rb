require_relative '../test_helper'

require 'dynamic_config/gatekeeper'

class DynamicConfigGatekeeperTest < Minitest::Test
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

  def setup
    @mock_datastore = MiniTest::Mock.new
    @gatekeeper = GatekeeperBase.new(@mock_datastore)
  end

  def test_allows
    @mock_datastore.expect(:get, {"[]" => true}, ["test"])
    assert @gatekeeper.allows("test")

    @mock_datastore.expect(:get, {"[]" => false}, ["test"])
    refute @gatekeeper.allows("test")

    @mock_datastore.expect(:get, {"[[\"type\",\"query\"]]" => true}, ["test"])
    assert @gatekeeper.allows("test", where: {type: "query"})

    @mock_datastore.expect(:get, {"[[\"type\",\"query\"]]" => false}, ["test"])
    refute @gatekeeper.allows("test", where: {type: "query"})

    @mock_datastore.verify
  end

  def test_basic_setter_functionality
    assert_raises ArgumentError do
      @gatekeeper.set("valid key", "non-boolean value")
    end

    @gatekeeper.stubs(:get_rule_map).returns({})

    @mock_datastore.expect(:set, true, ["valid key", {"[]" => true}])
    assert @gatekeeper.set("valid key", value: true)

    @mock_datastore.expect(:set, true, ["valid key", {"[]" => true, "[[\"type\",\"query\"]]" => true}])
    assert @gatekeeper.set("valid key", value: true, where: {type: "query"})

    @mock_datastore.verify
    @gatekeeper.unstub(:get_rule_map)
  end

  def test_delete
    assert_raises ArgumentError do
      @gatekeeper.delete(:invalid_key, where: {})
    end

    @gatekeeper.stubs(:get_rule_map).returns({"[[\"type\",\"query\"]]" => true})

    refute @gatekeeper.delete("nonexistent key")
    refute @gatekeeper.delete("valid key", where: {"nonexistent type" => "query"})
    refute @gatekeeper.delete("valid key", where: {"type" => "nonexistent query"})

    @mock_datastore.expect(:set, true, ["valid key", {}])
    assert @gatekeeper.delete("valid key", where: {"type" => "query"})

    @mock_datastore.verify
    @gatekeeper.unstub(:get_rule_map)
  end

  def test_where_key
    assert_equal "[]", @gatekeeper.where_key({})

    assert_equal "[[\"script_name\",\"Test Script\"]]",
      @gatekeeper.where_key({script_name: "Test Script"})

    assert_equal "[[\"lesson_name\",\"Test Lesson\"],[\"script_name\",\"Test Script\"]]",
      @gatekeeper.where_key({script_name: "Test Script", lesson_name: "Test Lesson"})
  end

  def test_to_hash
    @mock_datastore.expect(:all, MOCK_DATA)
    expected = {
      'basic feature': [{"rule" => nil, "value" => true}],
      'empty feature': [],
      'complex feature': [
        {"rule" => nil, "value" => true},
        {"rule" => nil, "where" => {"type" => "query"}, "value" => false}
      ]
    }
    assert_equal(expected, @gatekeeper.to_hash)
    @mock_datastore.verify
  end

  def test_feature_names
    @mock_datastore.expect(:all, MOCK_DATA)
    assert_equal(Set[:'basic feature', :'complex feature'], @gatekeeper.feature_names)
    @mock_datastore.verify
  end

  def test_property_values
    @mock_datastore.expect(:all, MOCK_DATA)
    assert_equal(Set[], @gatekeeper.property_values(""))

    @mock_datastore.expect(:all, MOCK_DATA)
    assert_equal(Set["query"], @gatekeeper.property_values("type"))

    @mock_datastore.verify
  end
end
