require_relative '../test_helper'
require 'cdo/properties'

class PropertiesTest < Minitest::Test
  KEY = 'key_to_delete'.freeze
  NONEXISTENT_KEY = 'non_existent_key'.freeze
  VALUE = 'value_to_delete'.freeze

  def setup
    DB[:properties].insert(key: KEY, value: VALUE.to_json)
    CDO.cache.clear
  end

  def test_set_with_new_values
    (1..5).each do |index|
      key = "key#{index}"
      value = "value#{index}"
      assert_equal value, Properties.set(key, value)
    end
    assert_equal 1 + 5, DB[:properties].count
  end

  def test_set_with_existing_value
    (1..5).each do |_index|
      assert_equal VALUE, Properties.set(KEY, VALUE)
    end
    assert_equal 1, DB[:properties].count
  end

  def test_get_when_key_exists
    assert_equal VALUE, Properties.get(KEY)
  end

  def test_get_when_key_does_not_exist
    assert_nil Properties.get(NONEXISTENT_KEY)
  end

  def test_delete_when_key_exists
    assert_equal 1, Properties.delete(KEY)
    assert_nil Properties.get(KEY)
  end

  def test_delete_when_key_does_not_exist
    assert_equal 0, Properties.delete(NONEXISTENT_KEY)
  end

  def teardown
    DB[:properties].where(key: KEY).delete
    (1..5).each {|i| DB[:properties].where(key: "key#{i}").delete}
  end
end
