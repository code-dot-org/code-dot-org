require_relative '../../test_helper'
require 'aws-sdk-redshiftdataapiservice'
require 'cdo/aws/redshift'

class TestRedshift < Minitest::Test
  def setup
    CDO.stubs(:redshift_cluster_id).returns('test-cluster')
    CDO.stubs(:redshift_admin_username).returns('admin')

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

  def test_execute_synchronous_success
    exec_resp = mock
    exec_resp.stubs(:id).returns('sync-123')
    Aws::RedshiftDataAPIService::Client.any_instance.expects(:execute_statement).returns(exec_resp)

    # Mock describe_statement sequence.
    # Note: `execute` calls `status` (which calls `describe_statement`), `wait_for_completion` calls `status`,
    # and `fetch_results` calls `describe_statement`.
    desc_started = mock
    desc_started.stubs(:status).returns('STARTED')

    desc_finished = mock
    desc_finished.stubs(:status).returns('FINISHED')
    desc_finished.stubs(:has_result_set).returns(true)

    # Return STARTED on first loop, then FINISHED on second loop, and FINISHED for result fetch.
    Aws::RedshiftDataAPIService::Client.any_instance.expects(:describe_statement).
      with(id: 'sync-123').
      times(3).
      returns(desc_started, desc_finished, desc_finished)

    col_meta = mock
    col_meta.stubs(:name).returns('val')

    field = mock
    field.stubs(:string_value).returns('data')
    field.stubs(:long_value).returns(nil)
    field.stubs(:boolean_value).returns(nil)
    field.stubs(:double_value).returns(nil)
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
end
