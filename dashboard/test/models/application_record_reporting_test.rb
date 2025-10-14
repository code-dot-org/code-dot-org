require 'test_helper'

class ApplicationRecordReportingTest < ActiveSupport::TestCase
  setup do
    @mock_connection = mock('connection')
    ApplicationRecord.stubs(:connection).returns(@mock_connection)
  end

  # Scenario 1: Production Aurora with RDS Proxy pointing to reader
  test 'reporting_database_configured? returns true for properly configured Aurora reporting database' do
    # Aurora detection succeeds
    @mock_connection.stubs(:select_value).with('SELECT @@aurora_version').returns('3.04.0')

    # All Aurora checks pass
    @mock_connection.stubs(:select_value).with('SELECT @@innodb_read_only').returns(1)
    @mock_connection.stubs(:select_value).with('SELECT @@aurora_read_replica_read_committed').returns(1)
    @mock_connection.stubs(:select_value).with('SELECT @@transaction_isolation').returns('READ-COMMITTED')
    @mock_connection.stubs(:select_value).with('SELECT @@max_execution_time').returns(0)
    @mock_connection.stubs(:select_value).with('SELECT @@aurora_server_id').returns('autoscale-prod-1')

    CDO.log.expects(:info).with(regexp_matches(/Reporting database validation succeeded on Aurora/))

    assert ApplicationRecord.reporting_database_configured?
  end

  test 'reporting_database_configured? returns false for misconfigured Aurora reporting database' do
    # Aurora detection succeeds
    @mock_connection.stubs(:select_value).with('SELECT @@aurora_version').returns('3.04.0')

    # Some checks fail
    @mock_connection.stubs(:select_value).with('SELECT @@innodb_read_only').returns(0)
    @mock_connection.stubs(:select_value).with('SELECT @@aurora_read_replica_read_committed').returns(0)
    @mock_connection.stubs(:select_value).with('SELECT @@transaction_isolation').returns('REPEATABLE-READ')
    @mock_connection.stubs(:select_value).with('SELECT @@max_execution_time').returns(30000)
    @mock_connection.stubs(:select_value).with('SELECT @@aurora_server_id').returns('autoscale-prod-0')

    CDO.log.expects(:error).with(regexp_matches(/Reporting database validation failed on Aurora/))
    CDO.log.expects(:error).with(regexp_matches(/Connection details:/))

    refute ApplicationRecord.reporting_database_configured?
  end

  # Scenario 2: MySQL Community Edition (local dev, CI, or localhost on EC2)
  test 'reporting_database_configured? returns true for properly configured MySQL Community Edition' do
    # Aurora detection fails (not Aurora)
    @mock_connection.stubs(:select_value).with('SELECT @@aurora_version').raises(
      ActiveRecord::StatementInvalid.new("Unknown system variable 'aurora_version'")
    )

    # Non-Aurora checks pass
    @mock_connection.stubs(:select_value).with('SELECT @@transaction_isolation').returns('READ-COMMITTED')
    @mock_connection.stubs(:select_value).with('SELECT @@max_execution_time').returns(0)

    CDO.log.expects(:info).with(regexp_matches(/Reporting database validation succeeded on MySQL Community Edition/))

    assert ApplicationRecord.reporting_database_configured?
  end

  test 'reporting_database_configured? returns false for misconfigured MySQL Community Edition' do
    # Aurora detection fails (not Aurora)
    @mock_connection.stubs(:select_value).with('SELECT @@aurora_version').raises(
      ActiveRecord::StatementInvalid.new("Unknown system variable 'aurora_version'")
    )

    # Non-Aurora checks fail
    @mock_connection.stubs(:select_value).with('SELECT @@transaction_isolation').returns('REPEATABLE-READ')
    @mock_connection.stubs(:select_value).with('SELECT @@max_execution_time').returns(5000)

    CDO.log.expects(:error).with(regexp_matches(/Reporting database validation failed on MySQL Community Edition/))
    CDO.log.expects(:error).with(regexp_matches(/Connection details:/))

    refute ApplicationRecord.reporting_database_configured?
  end
end
