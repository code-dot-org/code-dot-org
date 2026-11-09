require_relative '../test_helper'

require 'dynamic_config/adapters/memory_adapter'

class MemoryAdapterTest < Minitest::Test
  def setup
    @adapter = MemoryAdapter.new
  end

  # Oj's default object mode would read "^o" as a Ruby object and ":a" as a symbol.
  def test_round_trips_keys_oj_would_interpret
    value = {'^o' => 'Object', ':a' => 1}
    @adapter.set('k', value)
    assert_equal value, @adapter.get('k')
    assert_equal({'k' => value}, @adapter.all)
  end
end
