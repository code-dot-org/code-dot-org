require_relative '../../../test_helper'
require 'cdo/aws/redshift/zero_etl'

class TestZeroEtl < Minitest::Test
  include Cdo::Aws::Redshift

  def setup
    # resync_tables / table_states validate names via ActiveRecord (`data_source_exists?`), which has
    # no connection in this bare lib test. Stub the seam so every name resolves to the dashboard
    # database by default; the Pegasus and rejection tests override it.
    ZeroEtl.stubs(:table_exists?).returns(true)
  end

  def test_redshift_database_appends_the_suffix
    assert_equal 'test_learningplatform_mysql_zeroetl', ZeroEtl.redshift_database('test')
  end

  def test_resync_tables_qualifies_a_single_table_with_the_redshift_schema
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

  def test_resync_and_report_returns_requested_when_the_refresh_is_accepted
    client = mock('client')
    client.stubs(:execute_async).returns('stmt-1')
    client.stubs(:wait_for_completion)
    client.stubs(:execute).returns(
      [{'schema_name' => 'dashboard_test', 'table_name' => 'levels_script_levels', 'table_state' => 'ResyncInitiated', 'reason' => ''}]
    )

    result = ZeroEtl.resync_and_report(client: client, environment_type: 'test', table_names: 'levels_script_levels')
    assert_equal :requested, result[:outcome]
    assert_empty result[:blocked]
  end

  def test_resync_and_report_returns_already_syncing_when_refresh_fails_but_table_is_healthy
    client = mock('client')
    client.stubs(:execute_async).returns('stmt-1')
    client.stubs(:wait_for_completion).raises(Client::QueryError.new('Statement FAILED'))
    client.stubs(:execute).returns(
      [{'schema_name' => 'dashboard_test', 'table_name' => 'levels_script_levels', 'table_state' => 'ResyncInitiated', 'reason' => ''}]
    )

    result = ZeroEtl.resync_and_report(client: client, environment_type: 'test', table_names: 'levels_script_levels')
    assert_equal :already_syncing, result[:outcome]
    assert_empty result[:blocked]
  end

  def test_resync_and_report_returns_blocked_when_a_table_is_not_healthy
    client = mock('client')
    client.stubs(:execute_async).returns('stmt-1')
    client.stubs(:wait_for_completion).raises(Client::QueryError.new('Statement FAILED'))
    client.stubs(:execute).returns(
      [{'schema_name' => 'dashboard_test', 'table_name' => 'levels_script_levels', 'table_state' => 'Failed', 'reason' => 'missing a primary key'}]
    )

    result = ZeroEtl.resync_and_report(client: client, environment_type: 'test', table_names: 'levels_script_levels')
    assert_equal :blocked, result[:outcome]
    assert_equal 1, result[:blocked].length
    assert_equal 'missing a primary key', result[:blocked].first['reason']
  end

  def test_resync_and_report_returns_unknown_when_no_state_rows_match
    client = mock('client')
    client.stubs(:execute_async).returns('stmt-1')
    client.stubs(:wait_for_completion)
    client.stubs(:execute).returns([])

    result = ZeroEtl.resync_and_report(client: client, environment_type: 'test', table_names: 'nonexistent')
    assert_equal :unknown, result[:outcome]
    assert_empty result[:states]
  end

  def test_redshift_schema_for_the_environment
    assert_equal 'dashboard_test', ZeroEtl.redshift_schema('test')
  end

  def test_redshift_schema_names_pegasus_per_environment
    assert_equal 'pegasus', ZeroEtl.redshift_schema('production', mysql_database: :pegasus)
    assert_equal 'pegasus_test', ZeroEtl.redshift_schema('test', mysql_database: :pegasus)
  end

  def test_redshift_schema_rejects_an_unknown_mysql_database
    error = assert_raises(ArgumentError) {ZeroEtl.redshift_schema('production', mysql_database: :bogus)}
    assert_includes error.message, 'bogus'
  end

  def test_parse_qualified_table_name_defaults_to_dashboard
    assert_equal [:dashboard, 'users'], ZeroEtl.parse_qualified_table_name('users')
  end

  def test_parse_qualified_table_name_reads_the_database_qualifier
    assert_equal [:pegasus, 'hoc_activity'], ZeroEtl.parse_qualified_table_name('pegasus.hoc_activity')
  end

  def test_parse_qualified_table_name_tolerates_an_empty_name
    # Degrades to an empty table name, which validation rejects by name, rather than looking like an
    # unknown database.
    assert_equal [:dashboard, ''], ZeroEtl.parse_qualified_table_name('')
  end

  def test_parse_qualified_table_name_rejects_an_unknown_qualifier
    error = assert_raises(ArgumentError) {ZeroEtl.parse_qualified_table_name('bogus.hoc_activity')}
    assert_includes error.message, 'bogus'
  end

  def test_resync_tables_qualifies_a_pegasus_table_with_the_pegasus_schema
    client = mock('client')
    client.expects(:execute_async).with(
      'ALTER DATABASE production_learningplatform_mysql_zeroetl INTEGRATION REFRESH TABLE pegasus.hoc_activity;'
    ).returns('stmt-pegasus')

    assert_equal 'stmt-pegasus', ZeroEtl.resync_tables(
      client: client, environment_type: 'production', table_names: 'pegasus.hoc_activity'
    )
  end

  def test_resync_tables_uses_the_pegasus_test_schema_on_test
    client = mock('client')
    client.expects(:execute_async).with(
      'ALTER DATABASE test_learningplatform_mysql_zeroetl INTEGRATION REFRESH TABLE pegasus_test.hoc_activity;'
    ).returns('stmt-pegasus-test')

    ZeroEtl.resync_tables(client: client, environment_type: 'test', table_names: 'pegasus.hoc_activity')
  end

  def test_resync_tables_mixes_databases_in_one_request
    client = mock('client')
    client.expects(:execute_async).with(
      'ALTER DATABASE production_learningplatform_mysql_zeroetl INTEGRATION REFRESH TABLE ' \
        'dashboard_production.users, pegasus.hoc_activity;'
    ).returns('stmt-mixed')

    ZeroEtl.resync_tables(
      client: client, environment_type: 'production', table_names: ['users', 'pegasus.hoc_activity']
    )
  end

  def test_resync_tables_validates_a_pegasus_table_against_the_pegasus_database
    # Absent from dashboard but present in pegasus: validation must consult the qualified database,
    # not the Rails connection's own.
    ZeroEtl.stubs(:table_exists?).returns(false)
    ZeroEtl.stubs(:table_exists?).with("#{CDO.pegasus_db_name}.hoc_activity").returns(true)

    client = mock('client')
    client.expects(:execute_async).returns('stmt-1')
    ZeroEtl.resync_tables(client: client, environment_type: 'production', table_names: 'pegasus.hoc_activity')
  end

  def test_resync_tables_rejects_a_table_missing_from_the_qualified_database
    ZeroEtl.stubs(:table_exists?).returns(false)
    client = mock('client')
    client.expects(:execute_async).never

    error = assert_raises(ArgumentError) do
      ZeroEtl.resync_tables(client: client, environment_type: 'production', table_names: 'pegasus.users')
    end
    assert_includes error.message, 'pegasus.users'
  end

  def test_redshift_schema_rejects_an_unknown_environment_type
    assert_raises(ArgumentError) {ZeroEtl.redshift_schema("test'; DROP DATABASE x; --")}
  end

  def test_resync_tables_rejects_a_table_that_is_not_in_the_schema
    ZeroEtl.stubs(:table_exists?).returns(false)
    client = mock('client')
    client.expects(:execute_async).never
    error = assert_raises(ArgumentError) do
      ZeroEtl.resync_tables(client: client, environment_type: 'test', table_names: 'users; DROP TABLE x; --')
    end
    assert_includes error.message, 'unknown table'
  end

  def test_table_states_rejects_a_table_that_is_not_in_the_schema
    ZeroEtl.stubs(:table_exists?).returns(false)
    client = mock('client')
    client.expects(:execute).never
    assert_raises(ArgumentError) do
      ZeroEtl.table_states(client: client, environment_type: 'test', table_names: ["users' OR '1'='1"])
    end
  end

  def test_redshift_database_accepts_a_symbol_environment_type
    assert_equal 'production_learningplatform_mysql_zeroetl', ZeroEtl.redshift_database(:production)
  end

  def test_redshift_database_rejects_an_unknown_environment_type
    error = assert_raises(ArgumentError) {ZeroEtl.redshift_database('bogus')}
    assert_includes error.message, 'bogus'
  end

  def test_redshift_database_rejects_a_sql_injection_attempt
    injection = "test'; DROP TABLE users; --"
    assert_raises(ArgumentError) {ZeroEtl.redshift_database(injection)}
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

  def test_export_status_buckets_tables_by_state
    client = mock('client')
    client.stubs(:execute).returns(
      [
        {'schema_name' => 'dashboard_production', 'table_name' => 'users', 'table_state' => 'Synced'},
        {'schema_name' => 'dashboard_production', 'table_name' => 'levels', 'table_state' => 'Synced'},
        {'schema_name' => 'pegasus', 'table_name' => 'hoc_activity', 'table_state' => 'ResyncInitiated'},
      ]
    )

    status = ZeroEtl.export_status(
      client: client, environment_type: 'production', table_names: %w[users levels hoc_activity]
    )
    assert_equal 3, status[:total]
    assert_equal({'Synced' => 2, 'ResyncInitiated' => 1}, status[:by_state])
    assert_empty status[:unhealthy]
    assert_empty status[:missing]
  end

  def test_export_status_separates_unhealthy_from_missing
    client = mock('client')
    client.stubs(:execute).returns(
      [
        {'schema_name' => 'dashboard_production', 'table_name' => 'users', 'table_state' => 'Synced'},
        {'schema_name' => 'pegasus', 'table_name' => 'hoc_activity', 'table_state' => 'Failed', 'reason' => 'no primary key'},
      ]
    )

    status = ZeroEtl.export_status(
      client: client, environment_type: 'production', table_names: %w[users hoc_activity never_replicated]
    )
    assert_equal 3, status[:total]
    assert_equal ['hoc_activity'], status[:unhealthy].map {|row| row['table_name']}.sort
    assert_equal ['never_replicated'], status[:missing]
  end

  def test_export_status_ignores_replicated_tables_we_do_not_export
    client = mock('client')
    client.stubs(:execute).returns(
      [
        {'schema_name' => 'dashboard_production', 'table_name' => 'users', 'table_state' => 'Synced'},
        {'schema_name' => 'pegasus', 'table_name' => 'schema_info', 'table_state' => 'Failed', 'reason' => 'no primary key'},
      ]
    )

    status = ZeroEtl.export_status(client: client, environment_type: 'production', table_names: %w[users])
    assert_equal 1, status[:total]
    assert_empty status[:unhealthy]
    assert_empty status[:missing]
  end

  def test_apply_required_integration_settings_enables_all_required_flags_on_the_redshift_database
    client = mock('client')
    client.expects(:execute).with(
      'ALTER DATABASE production_learningplatform_mysql_zeroetl INTEGRATION SET ' \
        'ACCEPTINVCHARS = TRUE TRUNCATECOLUMNS = TRUE;'
    )

    sql = ZeroEtl.apply_required_integration_settings(client: client, environment_type: 'production')
    assert_includes sql, 'INTEGRATION SET ACCEPTINVCHARS = TRUE TRUNCATECOLUMNS = TRUE'
  end
end
