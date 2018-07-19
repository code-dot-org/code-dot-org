require_relative 'test_helper'
require 'cdo/sqlite_key_value'
require 'active_support/core_ext/numeric/bytes'

class SqliteKeyValueTest < Minitest::Test
  def test_sqlite_key_value
    sqlite = Cdo::SqliteKeyValue.new(':memory:', size: 100.kilobytes)
    sqlite['key'] = 'value'
    assert_equal 'value', sqlite['key']

    sqlite.transaction do
      sqlite['key2'] = 'value2'
    end
    assert_equal 'value2', sqlite['key2']
    sqlite.close
  end
end
