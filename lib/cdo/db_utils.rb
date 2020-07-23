require 'cdo/rake_utils'

module DBUtils
  # Workaround for 'No database selected' issue with ProxySQL schema cache.
  # Ref: https://github.com/sysown/proxysql/issues/698#issuecomment-279771373
  def self.reload_proxy_backends
    # Do nothing if proxy is not configured.
    return unless CDO.db_proxy_admin

    # Note: The admin-interface solution does NOT currently work.
    # require 'cdo/mysql_console_helper'
    # MysqlConsoleHelper.run CDO.db_proxy_admin, <<~SQL
    # UPDATE mysql_servers SET status='OFFLINE_HARD';
    # LOAD MYSQL SERVERS TO RUNTIME;
    # UPDATE mysql_servers SET status='ONLINE';
    # LOAD MYSQL SERVERS TO RUNTIME;
    # SQL

    # Only restart if service is active.
    return unless system('service proxysql status >/dev/null 2>&1')
    RakeUtils.restart_service('proxysql')
    sleep 2
  end
end
