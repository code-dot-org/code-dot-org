require 'test_helper'

# Guards the invariant that config/database.yml declares every database ApplicationRecord connects to, in every
# environment. Read splitting used to be conditional: `primary_replica` was omitted wherever the reader and writer
# credentials matched, which silently left local development, continuous integration builds and adhocs without one.
class DatabaseConfigurationTest < ActiveSupport::TestCase
  CONFIGS = ActiveRecord::Base.configurations.configs_for(env_name: Rails.env, include_hidden: true).freeze

  test 'declares every database ApplicationRecord connects to' do
    assert_equal %w[primary primary_replica primary_reporting].sort, CONFIGS.map(&:name).sort
  end

  test 'declares the reader databases as replicas' do
    %w[primary_replica primary_reporting].each do |name|
      config = CONFIGS.find {|candidate| candidate.name == name}
      assert config.replica?, "#{name} must be declared `replica: true`"
    end
  end

  test 'connects the reader databases as a different SQL user than the writer' do
    # Where there is no Aurora cluster the reader endpoint names the same MySQL server as the writer, so the SQL user
    # is the only thing separating a read connection from a write connection.
    writer = CONFIGS.find {|config| config.name == 'primary'}
    %w[primary_replica primary_reporting].each do |name|
      reader = CONFIGS.find {|config| config.name == name}
      refute_equal writer.configuration_hash[:username], reader.configuration_hash[:username],
        "#{name} must not connect as the writer's SQL user"
    end
  end

  RDS_PROXY_WRITER = 'rds-proxy-writer.example.com'.freeze
  DATABASE_WRITER = 'database-writer.example.com'.freeze
  PROXYSQL_HOST = '127.0.0.1'.freeze

  # Re-renders config/database.yml against a stubbed deployment and execution context. `database_configuration` is not
  # memoized, so each call reads and renders the file again. Local development and continuous integration builds point
  # every endpoint at the same host, so distinct hostnames are what make the assertions below meaningful.
  def rendered_pool(name, db_proxy:, execution_context:)
    CDO.stubs(:db_proxy).returns(db_proxy)
    CDO.stubs(:execution_context).returns(execution_context)
    CDO.stubs(:db_endpoint_proxy_writer).returns(RDS_PROXY_WRITER)
    CDO.stubs(:db_endpoint_writer).returns(DATABASE_WRITER)
    Rails.application.config.database_configuration.fetch(Rails.env).fetch(name)
  end

  test 'connects writes through RDS Proxy from processes that serve concurrent requests' do
    [:web_application, :active_job_worker].each do |context|
      assert_equal RDS_PROXY_WRITER,
        rendered_pool('primary', db_proxy: 'rdsproxy', execution_context: context)['host'],
        "#{context} must connect writes through RDS Proxy"
    end
  end

  test 'connects writes directly to the database writer endpoint from every other process' do
    # The build, migrations, cron jobs and dashboard-console run one long task rather than many concurrent short ones,
    # so they gain nothing from multiplexing and should not inherit the proxy's timeout and pinning behavior.
    assert_equal DATABASE_WRITER,
      rendered_pool('primary', db_proxy: 'rdsproxy', execution_context: nil)['host']
  end

  test 'connects writes through ProxySQL from every process' do
    # ProxySQL's endpoint is substituted into CDO.dashboard_db_writer by the Chef recipe at build time, so there is no
    # unproxied alternative to fall back to and the execution context makes no difference.
    CDO.stubs(:db_proxy_admin).returns("mysql://admin:not-a-secret@#{PROXYSQL_HOST}:6032/")
    CDO.stubs(:dashboard_db_writer).
      returns("mysql://dashboard:not-a-secret@#{PROXYSQL_HOST}:6033/#{CDO.dashboard_db_name}")
    [nil, :web_application, :active_job_worker].each do |context|
      assert_equal PROXYSQL_HOST,
        rendered_pool('primary', db_proxy: 'proxysql', execution_context: context)['host'],
        "#{context.inspect} must connect writes through ProxySQL"
    end
  end

  test 'connects reads through the proxy from every process' do
    # Unlike the writer pool, the reader pools have no direct endpoint to fall back to: configuration publishes only
    # proxy endpoints for reads, so bypassing would move reads onto the writer instance.
    [nil, :web_application, :active_job_worker].each do |context|
      refute_equal DATABASE_WRITER,
        rendered_pool('primary_replica', db_proxy: 'rdsproxy', execution_context: context)['host'],
        "#{context.inspect} must not move reads onto the writer instance"
    end
  end
end
