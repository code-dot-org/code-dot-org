module Cdo
  # Which database proxy, if any, a process connects through. ActiveRecord and Sequel both use this module to initialize.
  module DatabaseProxy
    PROXYSQL = 'proxysql'.freeze
    RDSPROXY = 'rdsproxy'.freeze
    NONE = 'none'.freeze # No proxy: connect to the database endpoints directly.

    # The proxy this process uses, reconciled against what is actually installed.
    def self.selected
      proxysql_installed = !CDO.db_proxy_admin.nil?
      proxy = CDO.db_proxy.to_s.strip
      # An unset `CDO.db_proxy` preserves the current production functionality, rather than silently moving
      # connections off ProxySQL.
      proxy = proxysql_installed ? PROXYSQL : NONE if proxy.empty?
      # ProxySQL serves connections only where the Chef recipe installed it.
      proxy = NONE if proxy == PROXYSQL && !proxysql_installed
      proxy
    end

    # Whether this process sends its writes through RDS Proxy. Connection multiplexing is for optimizing connections
    # when multiple processes are executing requests concurrently. Build jobs and administrative Ruby shell
    # scripts should talk directly to the cluster's writer endpoint to minimize complexity and risk.
    def self.rds_proxy_for_writes?
      selected == RDSPROXY && CDO.running_web_application?
    end

    # Whether this process sends its replica reads through RDS Proxy. The rule is the same as for writes, for one
    # further reason: a process that is not the web application holds its pools for hours and enters a
    # `connected_to(role: :reading)` block rarely, so a replica connection it leaves idle can be closed behind the
    # proxy before the next read reaches for it.
    def self.rds_proxy_for_reads?
      rds_proxy_for_writes?
    end
  end
end
