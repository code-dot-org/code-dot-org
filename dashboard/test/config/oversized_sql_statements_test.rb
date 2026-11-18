require 'test_helper'

class OversizedSqlStatementsTest < ActiveSupport::TestCase
  WRITES = {
    "INSERT INTO `level_sources` (`level_id`, `md5`, `data`) VALUES (1, 'abc', 'x')" => 'level_sources',
    "REPLACE INTO `datablock_storage_kvps` (`project_id`) VALUES (1)" => 'datablock_storage_kvps',
    "UPDATE `users` SET `properties` = '{}' WHERE `id` = 1" => 'users',
    "DELETE FROM `channel_tokens` WHERE `id` = 1" => 'channel_tokens',
  }.freeze

  teardown do
    ActiveRecord::Base.connection.rds_proxy_pin_reason = nil
  end

  test 'names the table a write statement targets' do
    WRITES.each do |sql, table|
      assert_equal table, Cdo::OversizedSqlStatements.target_table(sql)
    end
  end

  test 'never reports an identifier taken from a quoted value' do
    sql = "INSERT INTO `level_sources` (`data`) VALUES ('UPDATE `secrets` SET x = 1')"
    assert_equal 'level_sources', Cdo::OversizedSqlStatements.target_table(sql)
  end

  test 'reports no table for a read, whose model is already named by the ActiveRecord label' do
    assert_nil Cdo::OversizedSqlStatements.target_table("SELECT 'x' AS `padding` FROM `users` LIMIT 1")
    assert_nil Cdo::OversizedSqlStatements.target_table('SELECT 1')
  end

  test 'omits its own frames from the reported source' do
    refute_includes Cdo::OversizedSqlStatements.source_frame.to_s,
      Cdo::OversizedSqlStatements::SELF_BASENAME
  end

  test 'pins the connection that ran an oversized statement' do
    connection = ActiveRecord::Base.connection
    connection.rds_proxy_pin_reason = nil

    connection.execute("SELECT '#{'x' * (Cdo::OversizedSqlStatements::LIMIT_BYTES + 1)}'")

    assert_equal Cdo::OversizedSqlStatements::PIN_REASON, connection.rds_proxy_pin_reason
  end

  test 'leaves the connection unpinned for a statement within the limit' do
    connection = ActiveRecord::Base.connection
    connection.rds_proxy_pin_reason = nil

    connection.execute('SELECT 1')

    assert_nil connection.rds_proxy_pin_reason
  end
end
