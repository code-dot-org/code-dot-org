require_relative '../../../test_helper'
require 'cdo/aws/redshift/zero_etl'

class TestZeroEtl < Minitest::Test
  include Cdo::Aws::Redshift

  def test_target_database_appends_the_suffix
    assert_equal 'test_learningplatform_mysql_zeroetl', ZeroEtl.target_database('test')
  end

  def test_resync_tables_qualifies_a_single_table_with_the_source_schema
    client = mock('client')
    client.expects(:execute_async).with(
      'ALTER DATABASE test_learningplatform_mysql_zeroetl INTEGRATION REFRESH TABLE dashboard_test.users;'
    ).returns('stmt-1')

    assert_equal 'stmt-1', ZeroEtl.resync_tables(client: client, environment_type: 'test', table_names: 'users')
  end

  def test_resync_tables_qualifies_and_joins_multiple_tables
    client = mock('client')
    client.expects(:execute_async).with(
      'ALTER DATABASE production_learningplatform_mysql_zeroetl INTEGRATION REFRESH TABLE ' \
        'dashboard_production.users, dashboard_production.levels;'
    ).returns('stmt-2')

    ZeroEtl.resync_tables(client: client, environment_type: 'production', table_names: %w[users levels])
  end

  def test_resync_tables_raises_on_an_empty_table_list
    error = assert_raises(ArgumentError) do
      ZeroEtl.resync_tables(client: mock('client'), environment_type: 'test', table_names: [])
    end
    assert_includes error.message, 'table_names must not be empty'
  end

  def test_target_database_accepts_a_symbol_environment_type
    assert_equal 'production_learningplatform_mysql_zeroetl', ZeroEtl.target_database(:production)
  end

  def test_target_database_rejects_an_unknown_environment_type
    error = assert_raises(ArgumentError) {ZeroEtl.target_database('bogus')}
    assert_includes error.message, 'bogus'
  end

  def test_target_database_rejects_a_sql_injection_attempt
    injection = "test'; DROP TABLE users; --"
    assert_raises(ArgumentError) {ZeroEtl.target_database(injection)}
  end

  def test_integration_errors_rejects_an_unknown_environment_type
    client = mock('client')
    client.expects(:execute).never
    assert_raises(ArgumentError) do
      ZeroEtl.integration_errors(client: client, environment_type: "x' OR '1'='1")
    end
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

  def test_table_states_queries_named_tables_in_the_target_database_regardless_of_state
    client = mock('client')
    client.expects(:execute).with do |sql|
      sql.include?('FROM SVV_INTEGRATION_TABLE_STATE') &&
        sql.include?("target_database = 'production_learningplatform_mysql_zeroetl'") &&
        sql.include?("table_name IN ('aichat_requests', 'users')")
    end.returns([{'schema_name' => 'dashboard_production', 'table_name' => 'aichat_requests', 'table_state' => 'Failed', 'reason' => "encountered '1224'"}])

    result = ZeroEtl.table_states(client: client, environment_type: 'production', table_names: %w[aichat_requests users])
    assert_equal "encountered '1224'", result.first['reason']
  end

  def test_table_states_returns_empty_without_querying_for_no_tables
    client = mock('client')
    client.expects(:execute).never
    assert_empty ZeroEtl.table_states(client: client, environment_type: 'production', table_names: [])
  end

  def test_all_table_states_returns_every_row_for_the_target_database_unfiltered
    client = mock('client')
    client.expects(:execute).with do |sql|
      sql.include?('FROM SVV_INTEGRATION_TABLE_STATE') &&
        sql.include?("target_database = 'production_learningplatform_mysql_zeroetl'") &&
        !sql.include?(' IN (') && !sql.include?('NOT IN')
    end.returns([{'table_name' => 'users', 'table_state' => 'Synced'}])

    result = ZeroEtl.all_table_states(client: client, environment_type: 'production')
    assert_equal 'users', result.first['table_name']
  end

  def test_apply_required_integration_settings_enables_all_required_flags_on_the_target_database
    client = mock('client')
    client.expects(:execute).with(
      'ALTER DATABASE production_learningplatform_mysql_zeroetl INTEGRATION SET ' \
        'ACCEPTINVCHARS = TRUE TRUNCATECOLUMNS = TRUE;'
    )

    sql = ZeroEtl.apply_required_integration_settings(client: client, environment_type: 'production')
    assert_includes sql, 'INTEGRATION SET ACCEPTINVCHARS = TRUE TRUNCATECOLUMNS = TRUE'
  end
end
