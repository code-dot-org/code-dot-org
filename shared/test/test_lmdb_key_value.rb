require_relative 'test_helper'
require 'cdo/lmdb_key_value'
require 'active_support/core_ext/numeric/bytes'
require 'tmpdir'

class LMDBKeyValueTest < Minitest::Test
  def test_lmdb_key_value
    Dir.mktmpdir do |dir|
      lmdb = Cdo::LMDBKeyValue.new(dir, size: 100.kilobytes)
      lmdb['key'] = 'value'
      assert_equal 'value', lmdb['key']

      lmdb.transaction do
        lmdb['key2'] = 'value2'
      end
      assert_equal 'value2', lmdb['key2']
      lmdb.close
    end
  end
end
