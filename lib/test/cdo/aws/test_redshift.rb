require_relative '../../test_helper'
require 'aws-sdk-redshiftdataapiservice'
require 'cdo/aws/redshift'

class TestRedshift < Minitest::Test
  def setup
    CDO.stubs(:redshift_cluster_id).returns('test-cluster')

    @redshift = Cdo::Redshift.new
    # Stub sleep so tests execute instantly instead of waiting in the polling loop.
    @redshift.stubs(:sleep)
  end

  def test_execute_async_returns_id_immediately
    mock_resp = mock
    mock_resp.stubs(:id).returns('async-123')

    Aws::RedshiftDataAPIService::Client.any_instance.expects(:execute_statement).returns(mock_resp)

    id = @redshift.execute_async('REFRESH MATERIALIZED VIEW mv')
    assert_equal 'async-123', id
  end

  def test_status_returns_current_state
    desc_resp = mock
    desc_resp.stubs(:status).returns('STARTED')

    Aws::RedshiftDataAPIService::Client.any_instance.expects(:describe_statement).
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
    Aws::RedshiftDataAPIService::Client.any_instance.expects(:describe_statement).
      with(id: 'wait-123').
      times(2).
      returns(desc_started, desc_finished)

    status = @redshift.wait_for_completion('wait-123')
    assert_equal 'FINISHED', status
  end

  def test_wait_for_completion_times_out
    desc_started = mock
    desc_started.stubs(:status).returns('STARTED')
    Aws::RedshiftDataAPIService::Client.any_instance.stubs(:describe_statement).returns(desc_started)

    # We expect the client to actively cancel the statement on the cluster
    Aws::RedshiftDataAPIService::Client.any_instance.expects(:cancel_statement).with(id: 'timeout-123')

    # Simulate Time passing to trigger the timeout
    start_time = Time.new(2025, 1, 1, 12, 0, 0)
    Time.stubs(:now).returns(
      start_time,          # Initial start_time declaration
      start_time + 1,      # First loop check (under timeout)
      start_time + 301     # Second loop check (exceeds 300s timeout)
    )

    error = assert_raises(Cdo::Redshift::QueryError) do
      @redshift.wait_for_completion('timeout-123', timeout: 300)
    end

    assert_includes error.message, 'timed out'
  end

  def test_fetch_results_all_data_types
    desc_finished = mock
    desc_finished.stubs(:has_result_set).returns(true)
    Aws::RedshiftDataAPIService::Client.any_instance.stubs(:describe_statement).returns(desc_finished)

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

    Aws::RedshiftDataAPIService::Client.any_instance.expects(:get_statement_result).returns(res_resp)

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
    Aws::RedshiftDataAPIService::Client.any_instance.expects(:execute_statement).returns(exec_resp)

    desc_finished = mock
    desc_finished.stubs(:status).returns('FINISHED')
    desc_finished.stubs(:has_result_set).returns(true)

    # Describe is called once in wait_for_completion and once in fetch_results
    Aws::RedshiftDataAPIService::Client.any_instance.expects(:describe_statement).
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

    Aws::RedshiftDataAPIService::Client.any_instance.expects(:get_statement_result).
      with(id: 'sync-123', next_token: nil).
      returns(res_resp)

    results = @redshift.execute("SELECT 'data' as val")
    assert_equal [{'val' => 'data'}], results
  end

  def test_execute_raises_on_failure
    exec_resp = mock
    exec_resp.stubs(:id).returns('fail-123')
    Aws::RedshiftDataAPIService::Client.any_instance.expects(:execute_statement).returns(exec_resp)

    desc_failed = mock
    desc_failed.stubs(:status).returns('FAILED')
    desc_failed.stubs(:error).returns('Syntax Error')

    # Wait loop calls status once (gets FAILED), then explicitly calls describe_statement to get the error.
    Aws::RedshiftDataAPIService::Client.any_instance.expects(:describe_statement).
      with(id: 'fail-123').
      twice.
      returns(desc_failed, desc_failed)

    error = assert_raises(Cdo::Redshift::QueryError) do
      @redshift.execute('BAD SQL')
    end
    assert_includes error.message, 'FAILED'
    assert_includes error.message, 'Syntax Error'
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
