require_relative 'test_helper'
require 'cdo/key_value'
require 'tmpdir'

class KeyValueTest < Minitest::Test
  def test_key_value
    Dir.mktmpdir do |dir|
      store = Cdo::KeyValue.new(dir)
      assert_nil store['key']
      store['key'] = 'value'
      store.flush
      assert_equal 'value', store['key']
    end
  end
end
