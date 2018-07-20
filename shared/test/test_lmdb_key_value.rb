require_relative 'test_helper'
require 'cdo/lmdb_key_value'
require 'active_support/core_ext/numeric/bytes'
require 'tmpdir'

class LMDBKeyValueTest < Minitest::Test
  def test_lmdb_key_value
    Dir.mktmpdir do |dir|
      lmdb = Cdo::LMDBKeyValue.new(dir, size: 100.kilobytes)
      assert_nil lmdb['key']
      lmdb['key'] = 'value'
      assert_equal 'value', lmdb['key']
      lmdb.close
    end
  end
end
