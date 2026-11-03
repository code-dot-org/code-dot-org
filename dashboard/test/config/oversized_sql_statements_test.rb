require 'test_helper'

# Guards that `Cdo::OversizedSqlStatements` reports where an oversized statement came from without ever reproducing
# the statement, which carries student program source and other personal data.
class OversizedSqlStatementsTest < ActiveSupport::TestCase
  WRITES = {
    "INSERT INTO `level_sources` (`level_id`, `md5`, `data`) VALUES (1, 'abc', 'x')" => 'level_sources',
    "REPLACE INTO `datablock_storage_kvps` (`project_id`) VALUES (1)" => 'datablock_storage_kvps',
    "UPDATE `users` SET `properties` = '{}' WHERE `id` = 1" => 'users',
    "DELETE FROM `channel_tokens` WHERE `id` = 1" => 'channel_tokens',
  }.freeze

  test 'names the table a write statement targets' do
    WRITES.each do |sql, table|
      assert_equal table, Cdo::OversizedSqlStatements.target_table(sql)
    end
  end

  # The statement is anchored, so a value that reads like a table reference cannot be mistaken for one. Reporting a
  # fragment of a student's program under `table=` would be a data leak, not a cosmetic bug.
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
end
