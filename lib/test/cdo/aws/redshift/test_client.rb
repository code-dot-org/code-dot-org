require_relative '../../../test_helper'
require 'aws-sdk-redshiftdataapiservice'
require 'cdo/aws/redshift/client'

class TestRedshiftClient < Minitest::Test
  def setup
    CDO.stubs(:redshift_cluster_id).returns('test-cluster')

    @redshift = Cdo::Aws::Redshift::Client.new
    # Stub sleep so tests execute instantly instead of waiting in the polling loop.
    @redshift.stubs(:sleep)
  end

  def test_execute_async_returns_id_immediately
    mock_resp = mock
    mock_resp.stubs(:id).returns('async-123')

    ::Aws::RedshiftDataAPIService::Client.any_instance.expects(:execute_statement).returns(mock_resp)

    id = @redshift.execute_async('REFRESH MATERIALIZED VIEW mv')
    assert_equal 'async-123', id
  end

  def test_status_returns_current_state
    desc_resp = mock
    desc_resp.stubs(:status).returns('STARTED')

    ::Aws::RedshiftDataAPIService::Client.any_instance.expects(:describe_statement).
      with(id: 'async-123').
      returns(desc_resp)

    assert_equal 'STARTED', @redshift.status('async-123')
  end

  def test_wait_for_completion_returns_finished
    desc_started = mock
    desc_started.stubs(:status).returns('STARTED')

    desc_finished = mock
    desc_finished.stubs(:status).returns('FINISHED')

    # Loops once on STARTED, then breaks on FINISHED
    ::Aws::RedshiftDataAPIService::Client.any_instance.expects(:describe_statement).
      with(id: 'wait-123').
      times(2).
      returns(desc_started, desc_finished)

    status = @redshift.wait_for_completion('wait-123')
    assert_equal 'FINISHED', status
  end

  def test_wait_for_completion_times_out
    desc_started = mock
    desc_started.stubs(:status).returns('STARTED')
    ::Aws::RedshiftDataAPIService::Client.any_instance.stubs(:describe_statement).returns(desc_started)

    # We expect the client to actively cancel the statement on the cluster
    ::Aws::RedshiftDataAPIService::Client.any_instance.expects(:cancel_statement).with(id: 'timeout-123')

    # Simulate Time passing to trigger the timeout
    start_time = Time.new(2025, 1, 1, 12, 0, 0)
    Time.stubs(:now).returns(
      start_time,          # Initial start_time declaration
      start_time + 1,      # First loop check (under timeout)
      start_time + 301     # Second loop check (exceeds 300s timeout)
    )

    error = assert_raises(Cdo::Aws::Redshift::Client::QueryError) do
      @redshift.wait_for_completion('timeout-123', timeout: 300)
    end

    assert_includes error.message, 'timed out'
  end

  def test_fetch_results_all_data_types
    desc_finished = mock
    desc_finished.stubs(:has_result_set).returns(true)
    ::Aws::RedshiftDataAPIService::Client.any_instance.stubs(:describe_statement).returns(desc_finished)

    # 1. Mock Column Metadata
    cols = %w[str lng bool_t bool_f dbl blb null_val].map do |name|
      meta = mock
      meta.stubs(:name).returns(name)
      meta
    end

    # 3. Create a row with every possible data type we parse
    row = [
      create_field(str: 'hello'),
      create_field(lng: 42),
      create_field(bool: true),
      create_field(bool: false),
      create_field(dbl: 3.14),
      create_field(blb: 'blobdata'),
      create_field(is_null: true)
    ]

    res_resp = mock
    res_resp.stubs(:column_metadata).returns(cols)
    res_resp.stubs(:records).returns([row])
    res_resp.stubs(:next_token).returns(nil)

    ::Aws::RedshiftDataAPIService::Client.any_instance.expects(:get_statement_result).returns(res_resp)

    results = @redshift.fetch_results('type-123')

    expected = [{
      'str' => 'hello',
      'lng' => 42,
      'bool_t' => true,
      'bool_f' => false, # Proves our fix works!
      'dbl' => 3.14,
      'blb' => 'blobdata',
      'null_val' => nil
    }]

    assert_equal expected, results
  end

  def test_execute_synchronous_success
    exec_resp = mock
    exec_resp.stubs(:id).returns('sync-123')
    ::Aws::RedshiftDataAPIService::Client.any_instance.expects(:execute_statement).returns(exec_resp)

    desc_finished = mock
    desc_finished.stubs(:status).returns('FINISHED')
    desc_finished.stubs(:has_result_set).returns(true)

    # Describe is called once in wait_for_completion and once in fetch_results
    ::Aws::RedshiftDataAPIService::Client.any_instance.expects(:describe_statement).
      with(id: 'sync-123').
      twice.
      returns(desc_finished, desc_finished)

    col_meta = mock
    col_meta.stubs(:name).returns('val')

    field = mock
    field.stubs(:string_value).returns('data')
    field.stubs(:long_value).returns(nil)
    field.stubs(:boolean_value).returns(nil)
    field.stubs(:double_value).returns(nil)
    field.stubs(:blob_value).returns(nil)
    field.stubs(:is_null).returns(false)

    res_resp = mock
    res_resp.stubs(:column_metadata).returns([col_meta])
    res_resp.stubs(:records).returns([[field]])
    res_resp.stubs(:next_token).returns(nil)

    ::Aws::RedshiftDataAPIService::Client.any_instance.expects(:get_statement_result).
      with(id: 'sync-123', next_token: nil).
      returns(res_resp)

    results = @redshift.execute("SELECT 'data' as val")
    assert_equal [{'val' => 'data'}], results
  end

  def test_execute_raises_on_failure
    exec_resp = mock
    exec_resp.stubs(:id).returns('fail-123')
    ::Aws::RedshiftDataAPIService::Client.any_instance.expects(:execute_statement).returns(exec_resp)

    desc_failed = mock
    desc_failed.stubs(:status).returns('FAILED')
    desc_failed.stubs(:error).returns('Syntax Error')
    desc_failed.stubs(:query_string).returns('BAD SQL')
    desc_failed.stubs(:sub_statements).returns([])

    # Wait loop calls status once (gets FAILED), then explicitly calls describe_statement to get the error.
    ::Aws::RedshiftDataAPIService::Client.any_instance.expects(:describe_statement).
      with(id: 'fail-123').
      twice.
      returns(desc_failed, desc_failed)

    error = assert_raises(Cdo::Aws::Redshift::Client::QueryError) do
      @redshift.execute('BAD SQL')
    end
    assert_includes error.message, 'FAILED'
    assert_includes error.message, 'Syntax Error'
    assert_includes error.message, 'SQL: BAD SQL'
  end

  def test_execute_failure_with_blank_error_surfaces_query_id_and_note
    exec_resp = mock
    exec_resp.stubs(:id).returns('blank-err-123')
    ::Aws::RedshiftDataAPIService::Client.any_instance.expects(:execute_statement).returns(exec_resp)

    # Mirrors the Data API quirk where a FAILED statement comes back with an empty Error and no
    # sub-statements (e.g., a parse error). The detail must still be actionable.
    desc_failed = mock
    desc_failed.stubs(:status).returns('FAILED')
    desc_failed.stubs(:error).returns('')
    desc_failed.stubs(:query_string).returns('SELECT bogus')
    desc_failed.stubs(:sub_statements).returns([])
    desc_failed.stubs(:redshift_query_id).returns(987_654)

    ::Aws::RedshiftDataAPIService::Client.any_instance.expects(:describe_statement).
      with(id: 'blank-err-123').
      twice.
      returns(desc_failed, desc_failed)

    error = assert_raises(Cdo::Aws::Redshift::Client::QueryError) do
      @redshift.execute('SELECT bogus')
    end
    assert_includes error.message, 'no error message'
    assert_includes error.message, '987654'
    assert_includes error.message, 'stl_error'
    assert_includes error.message, 'SQL: SELECT bogus'
  end

  def test_batch_execute_async_returns_id
    mock_resp = mock
    mock_resp.stubs(:id).returns('batch-123')

    ::Aws::RedshiftDataAPIService::Client.any_instance.expects(:batch_execute_statement).returns(mock_resp)

    ids = @redshift.batch_execute_async(['DROP MATERIALIZED VIEW IF EXISTS s.v', 'CREATE MATERIALIZED VIEW s.v AS SELECT 1'])
    assert_equal ['batch-123'], ids
  end

  def test_batch_execute_async_splits_over_the_limit_when_separate_transactions_allowed
    resp0 = mock
    resp0.stubs(:id).returns('batch-0')
    resp1 = mock
    resp1.stubs(:id).returns('batch-1')

    batch_sizes = []
    ::Aws::RedshiftDataAPIService::Client.any_instance.stubs(:batch_execute_statement).
      with {|args| batch_sizes << args[:sqls].length; true}.
      returns(resp0, resp1)

    max = Cdo::Aws::Redshift::Client::MAX_BATCH_STATEMENTS
    sqls = Array.new(max + 1) {|i| "SELECT #{i}"}
    ids = @redshift.batch_execute_async(sqls, allow_separate_transactions: true)

    assert_equal ['batch-0', 'batch-1'], ids
    assert_equal [max, 1], batch_sizes
  end

  def test_batch_execute_async_raises_over_the_limit_without_opt_in
    ::Aws::RedshiftDataAPIService::Client.any_instance.expects(:batch_execute_statement).never

    max = Cdo::Aws::Redshift::Client::MAX_BATCH_STATEMENTS
    sqls = Array.new(max + 1) {|i| "SELECT #{i}"}
    error = assert_raises(ArgumentError) {@redshift.batch_execute_async(sqls)}
    assert_includes error.message, 'allow_separate_transactions'
  end

  def test_batch_execute_async_allows_exactly_the_limit_in_one_atomic_batch
    resp = mock
    resp.stubs(:id).returns('batch-0')
    batch_sizes = []
    ::Aws::RedshiftDataAPIService::Client.any_instance.stubs(:batch_execute_statement).
      with {|args| batch_sizes << args[:sqls].length; true}.
      returns(resp)

    max = Cdo::Aws::Redshift::Client::MAX_BATCH_STATEMENTS
    ids = @redshift.batch_execute_async(Array.new(max) {|i| "SELECT #{i}"})

    assert_equal ['batch-0'], ids
    assert_equal [max], batch_sizes
  end

  def test_batch_execute_async_preserves_submitted_ids_when_a_later_batch_fails_to_submit
    resp0 = mock
    resp0.stubs(:id).returns('batch-0')
    ::Aws::RedshiftDataAPIService::Client.any_instance.stubs(:batch_execute_statement).
      returns(resp0).then.raises(StandardError.new('throttled'))

    max = Cdo::Aws::Redshift::Client::MAX_BATCH_STATEMENTS
    sqls = Array.new(max + 1) {|i| "SELECT #{i}"}
    error = assert_raises(Cdo::Aws::Redshift::Client::BatchSubmitError) do
      @redshift.batch_execute_async(sqls, allow_separate_transactions: true)
    end
    assert_equal ['batch-0'], error.submitted_ids
    assert_equal 'throttled', error.cause.message
  end

  def test_batch_execute_async_propagates_original_error_when_the_first_batch_fails_to_submit
    ::Aws::RedshiftDataAPIService::Client.any_instance.stubs(:batch_execute_statement).
      raises(StandardError.new('boom'))

    error = assert_raises(StandardError) {@redshift.batch_execute_async(['SELECT 1'])}
    assert_equal 'boom', error.message
    refute_kind_of Cdo::Aws::Redshift::Client::BatchSubmitError, error
  end

  def test_batch_execute_raises_over_the_limit_without_opt_in
    ::Aws::RedshiftDataAPIService::Client.any_instance.expects(:batch_execute_statement).never

    max = Cdo::Aws::Redshift::Client::MAX_BATCH_STATEMENTS
    sqls = Array.new(max + 1) {|i| "SELECT #{i}"}
    assert_raises(ArgumentError) {@redshift.batch_execute(sqls)}
  end

  def test_batch_execute_async_submits_nothing_for_an_empty_list
    ::Aws::RedshiftDataAPIService::Client.any_instance.expects(:batch_execute_statement).never
    assert_empty @redshift.batch_execute_async([])
  end

  def test_batch_execute_returns_joined_outcome_on_success
    batch_resp = mock
    batch_resp.stubs(:id).returns('batch-sync-123')
    ::Aws::RedshiftDataAPIService::Client.any_instance.expects(:batch_execute_statement).returns(batch_resp)

    desc_finished = mock
    desc_finished.stubs(:status).returns('FINISHED')
    ::Aws::RedshiftDataAPIService::Client.any_instance.stubs(:describe_statement).
      with(id: 'batch-sync-123').
      returns(desc_finished)

    result = @redshift.batch_execute(['SELECT 1', 'SELECT 2'])
    assert_equal [0], result[:finished]
    assert_empty result[:failed]
  end

  def test_batch_execute_returns_failed_batch_rather_than_raising
    batch_resp = mock
    batch_resp.stubs(:id).returns('batch-fail-123')
    ::Aws::RedshiftDataAPIService::Client.any_instance.expects(:batch_execute_statement).returns(batch_resp)

    desc_failed = mock
    desc_failed.stubs(:status).returns('FAILED')
    desc_failed.stubs(:error).returns('permission denied for schema s')
    ::Aws::RedshiftDataAPIService::Client.any_instance.stubs(:describe_statement).
      with(id: 'batch-fail-123').
      returns(desc_failed)

    result = @redshift.batch_execute(['DROP MATERIALIZED VIEW IF EXISTS s.v', 'CREATE MATERIALIZED VIEW s.v AS SELECT 1'])
    assert_empty result[:finished]
    assert_equal [[0, 'permission denied for schema s']], result[:failed]
  end

  def test_batch_execute_reports_each_batch_separately_on_the_split_path
    resp0 = mock
    resp0.stubs(:id).returns('batch-0')
    resp1 = mock
    resp1.stubs(:id).returns('batch-1')
    ::Aws::RedshiftDataAPIService::Client.any_instance.stubs(:batch_execute_statement).
      returns(resp0).then.returns(resp1)

    ok = mock
    ok.stubs(:status).returns('FINISHED')
    bad = mock
    bad.stubs(:status).returns('FAILED')
    bad.stubs(:error).returns('boom')
    ::Aws::RedshiftDataAPIService::Client.any_instance.stubs(:describe_statement).
      with(id: 'batch-0').returns(ok)
    ::Aws::RedshiftDataAPIService::Client.any_instance.stubs(:describe_statement).
      with(id: 'batch-1').returns(bad)

    max = Cdo::Aws::Redshift::Client::MAX_BATCH_STATEMENTS
    sqls = Array.new(max + 1) {|i| "SELECT #{i}"}
    result = @redshift.batch_execute(sqls, allow_separate_transactions: true)

    assert_equal [0], result[:finished]
    assert_equal [[1, 'boom']], result[:failed]
  end

  def test_execute_failure_includes_sub_statement_errors
    exec_resp = mock
    exec_resp.stubs(:id).returns('multi-fail-123')
    ::Aws::RedshiftDataAPIService::Client.any_instance.expects(:execute_statement).returns(exec_resp)

    sub1 = mock
    sub1.stubs(:status).returns('FINISHED')
    sub1.stubs(:error).returns(nil)
    sub1.stubs(:query_string).returns('DROP MATERIALIZED VIEW IF EXISTS schema.view')

    sub2 = mock
    sub2.stubs(:status).returns('FAILED')
    sub2.stubs(:error).returns('relation "schema.view" already exists')
    sub2.stubs(:query_string).returns('CREATE MATERIALIZED VIEW schema.view AS SELECT id FROM t')

    desc_failed = mock
    desc_failed.stubs(:status).returns('FAILED')
    desc_failed.stubs(:error).returns('')
    desc_failed.stubs(:query_string).returns('DROP ...; CREATE ...')
    desc_failed.stubs(:sub_statements).returns([sub1, sub2])

    ::Aws::RedshiftDataAPIService::Client.any_instance.expects(:describe_statement).
      with(id: 'multi-fail-123').
      twice.
      returns(desc_failed, desc_failed)

    error = assert_raises(Cdo::Aws::Redshift::Client::QueryError) do
      @redshift.execute('DROP ...; CREATE ...')
    end
    assert_includes error.message, 'Sub-statement 2 FAILED'
    assert_includes error.message, 'relation "schema.view" already exists'
    assert_includes error.message, 'CREATE MATERIALIZED VIEW'
  end

  def test_wait_for_statements_polls_and_partitions_finished_and_failed
    @redshift.stubs(:status).with('id-a').returns('STARTED', 'FINISHED')
    @redshift.stubs(:status).with('id-b').returns('STARTED', 'STARTED', 'FAILED')
    @redshift.stubs(:describe_statement).with('id-b').returns(stub('desc', error: "Bad query\nwith details", sub_statements: []))

    events = []
    result = @redshift.wait_for_statements(
      statements: {'a' => 'id-a', 'b' => 'id-b'}, poll_interval: 0
    ) {|event, key, _| events << [event, key]}

    assert_equal ['a'], result[:finished]
    assert_equal [['b', 'Bad query']], result[:failed]
    assert_includes events, [:finished, 'a']
    assert_includes events, [:failed, 'b']
  end

  def test_wait_for_statements_raises_on_timeout
    @redshift.stubs(:status).returns('STARTED')

    assert_raises(Cdo::Aws::Redshift::Client::QueryError) do
      @redshift.wait_for_statements(statements: {'a' => 'id-a'}, poll_interval: 0, timeout: 0)
    end
  end

  def test_wait_for_statements_returns_immediately_for_empty_set
    @redshift.expects(:status).never

    result = @redshift.wait_for_statements(statements: {}, poll_interval: 0)

    assert_empty result[:finished]
    assert_empty result[:failed]
  end

  def test_wait_for_statements_treats_aborted_as_failed
    @redshift.stubs(:status).with('id-a').returns('ABORTED')
    @redshift.stubs(:describe_statement).with('id-a').returns(stub('desc', error: nil, sub_statements: []))

    result = @redshift.wait_for_statements(statements: {'a' => 'id-a'}, poll_interval: 0)

    assert_equal [['a', '(ABORTED)']], result[:failed]
  end

  private def create_field(str: nil, lng: nil, bool: nil, dbl: nil, blb: nil, is_null: false)
    f = mock
    f.stubs(:string_value).returns(str)
    f.stubs(:long_value).returns(lng)
    f.stubs(:boolean_value).returns(bool)
    f.stubs(:double_value).returns(dbl)
    f.stubs(:blob_value).returns(blb)
    f.stubs(:is_null).returns(is_null)
    f
  end
end
