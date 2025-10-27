class ApplicationRecord < ActiveRecord::Base
  self.abstract_class = true

  connects_to database: {
    writing: Policies::ActiveRecordRoles.get_writing_role_name,
    reading: Policies::ActiveRecordRoles.get_reading_role_name,
    reporting: Policies::ActiveRecordRoles.get_reporting_role_name,
  }

  # Our infrastructure code falls back to setting `CDO.db_endpoint_proxy_reporting` to the writer database (typically
  # MySQL Community Edition runnong on LOCALHOST)on environments that do not have an Aurora cluster with a reader
  # database instance and a reporting RDS Proxy so that usage of the reporting role does not raise an error on local
  # development environments or continuous integration environments. Optionally use this method to verify that the
  # current environment actually has a reporting database.
  def self.reporting_database_configured?
    connected_to(role: :reporting) do
      conn = connection

      # Detect if this is Aurora by querying an Aurora-specific variable
      is_aurora = begin
        conn.select_value('SELECT @@aurora_version')
        true
      rescue ActiveRecord::StatementInvalid
        false
      end

      checks = {
        transaction_isolation: conn.select_value('SELECT @@transaction_isolation'),
        max_execution_time: conn.select_value('SELECT @@max_execution_time')
      }.tap do |h|
        if is_aurora
          h[:innodb_read_only] = conn.select_value('SELECT @@innodb_read_only')
          h[:aurora_read_replica_read_committed] = conn.select_value('SELECT @@aurora_read_replica_read_committed')
          h[:aurora_server_id] = conn.select_value('SELECT @@aurora_server_id')
        end
      end

      errors = []
      errors << "Not on InnoDB read-only instance (expected 1, got #{checks[:innodb_read_only]})" if is_aurora && checks[:innodb_read_only] != 1
      errors << "aurora_read_replica_read_committed not ON (expected 1, got #{checks[:aurora_read_replica_read_committed]})" if is_aurora && checks[:aurora_read_replica_read_committed] != 1
      errors << "Wrong isolation level (expected 'READ-COMMITTED', got '#{checks[:transaction_isolation]}')" unless checks[:transaction_isolation] == 'READ-COMMITTED'
      errors << "max_execution_time not 0 (expected 0, got #{checks[:max_execution_time]})" unless checks[:max_execution_time] == 0

      db_type = is_aurora ? "Aurora" : "MySQL Community Edition"

      if errors.any?
        CDO.log.error "Reporting database validation failed on #{db_type}: #{errors.join(', ')}"
        CDO.log.error "Connection details: #{checks.inspect}"
        false
      else
        CDO.log.info "Reporting database validation succeeded on #{db_type}: #{checks.inspect}"
        true
      end
    end
  end
end
