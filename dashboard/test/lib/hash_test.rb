require 'test_helper'
class HashTest < ActiveSupport::TestCase
  def test_camelize_keys
    # empty
    assert_equal Hash.new, Hash.new.camelize_keys

    non_string_keys = {1 => 2, 3 => 4, false => true}
    non_string_keys_camelized = {'1' => 2, '3' => 4, 'false' => true} # converted to strings
    assert_equal non_string_keys_camelized, non_string_keys.camelize_keys

    symbol_keys = {something: '1', some_thing_else: '2'}
    symbol_keys_camelized = {'something' => '1', 'someThingElse' => '2'}
    assert_equal symbol_keys_camelized, symbol_keys.camelize_keys

    string_keys = {'something' => '1', 'some_thing_else' => '2', 'words and sentences' => 3}
    string_keys_camelized = {'something' => '1', 'someThingElse' => '2', 'words and sentences' => 3}
    assert_equal string_keys_camelized, string_keys.camelize_keys
  end
end
