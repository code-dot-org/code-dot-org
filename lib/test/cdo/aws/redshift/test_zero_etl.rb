require_relative '../../../test_helper'
require 'cdo/aws/redshift/zero_etl'

class TestZeroEtl < Minitest::Test
  include Cdo::Aws::Redshift

  def test_target_database_appends_the_suffix
    assert_equal 'test_learningplatform_mysql_zeroetl', ZeroEtl.target_database('test')
  end

  def test_integration_errors_queries_svv_integration_for_the_target_database_error_state
    client = mock('client')
    client.expects(:execute).with do |sql|
      sql.include?('FROM SVV_INTEGRATION') &&
        sql.include?("target_database = 'production_learningplatform_mysql_zeroetl'") &&
        sql.include?("state = 'ErrorState'")
    end.returns([{'integration_id' => 'i-1', 'state' => 'ErrorState'}])

    result = ZeroEtl.integration_errors(client: client, environment_type: 'production')
    assert_equal 'i-1', result.first['integration_id']
  end

  def test_unsynced_tables_excludes_synced_and_resync_initiated_for_the_target_database
    client = mock('client')
    client.expects(:execute).with do |sql|
      sql.include?('FROM SVV_INTEGRATION_TABLE_STATE') &&
        sql.include?("target_database = 'test_learningplatform_mysql_zeroetl'") &&
        sql.include?("table_state NOT IN ('Synced', 'ResyncInitiated')")
    end.returns([{'schema_name' => 'dashboard_test', 'table_name' => 'users', 'table_state' => 'Failed'}])

    result = ZeroEtl.unsynced_tables(client: client, environment_type: 'test')
    assert_equal 'users', result.first['table_name']
  end
end
