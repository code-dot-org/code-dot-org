require_relative '../test_helper'
require 'cdo/sequel'

class SequelTest < Minitest::Test
  def test_mysql2_uri
    assert_equal 'mysql2://reader:secret@db.example.com:3306/dashboard',
      Cdo::Sequel.mysql2_uri(
        host: 'db.example.com',
        port: 3306,
        username: 'reader',
        password: 'secret',
        database: 'dashboard'
      )
  end

  def test_mysql2_uri_accepts_string_port
    assert_equal 'mysql2://reader:secret@db.example.com:3306/dashboard',
      Cdo::Sequel.mysql2_uri(
        host: 'db.example.com',
        port: '3306',
        username: 'reader',
        password: 'secret',
        database: 'dashboard'
      )
  end

  def test_mysql2_uri_omits_optional_parts
    assert_equal 'mysql2://root:@localhost',
      Cdo::Sequel.mysql2_uri(host: 'localhost', username: 'root', password: '')
  end

  # A password containing URI-reserved characters must survive the round-trip
  # Sequel performs: URI.parse followed by unescaping the userinfo components.
  # Without percent-encoding, URI::Generic.build rejects such a password
  # outright, and '@' would truncate the host.
  def test_mysql2_uri_escapes_reserved_characters
    password = "p@ss:w/rd#1 +&?"
    uri = Cdo::Sequel.mysql2_uri(
      host: 'db.example.com',
      port: 3306,
      username: 'read/er',
      password: password,
      database: 'dashboard'
    )

    parsed = URI.parse(uri)
    assert_equal 'db.example.com', parsed.host
    assert_equal 3306, parsed.port
    assert_equal '/dashboard', parsed.path
    assert_equal 'read/er', URI::DEFAULT_PARSER.unescape(parsed.user)
    assert_equal password, URI::DEFAULT_PARSER.unescape(parsed.password)
  end

  # Cdo::Sequel.database_connection_pool rewrites a 'mysql:' scheme to 'mysql2:'
  # with a plain String#gsub. Percent-encoding keeps a ':' out of the userinfo,
  # so a password containing the literal text 'mysql:' cannot be corrupted.
  def test_mysql2_uri_survives_scheme_rewrite
    uri = Cdo::Sequel.mysql2_uri(
      host: 'localhost',
      username: 'root',
      password: 'mysql:pw',
      database: 'dashboard'
    )

    assert_equal uri, uri.gsub('mysql:', 'mysql2:')
    assert_equal 'mysql:pw', URI::DEFAULT_PARSER.unescape(URI.parse(uri).password)
  end

  PROXYSQL_URI = 'mysql://dashboard:not-a-secret@127.0.0.1:6033/dashboard_production'.freeze
  RDS_PROXY_WRITER = 'rds-proxy-writer.example.com'.freeze
  DATABASE_WRITER = 'database-writer.example.com'.freeze

  # Stub the settings `Cdo::Sequel.dashboard_writer_uri` composes from. `db_proxy_admin` stands in for ProxySQL being
  # installed, which is what `Cdo::DatabaseProxy` reconciles the configured proxy against.
  def stub_endpoints(db_proxy:, execution_context: nil, proxysql_installed: false)
    CDO.stubs(:db_proxy).returns(db_proxy)
    CDO.stubs(:execution_context).returns(execution_context)
    CDO.stubs(:db_proxy_admin).returns(proxysql_installed ? 'mysql://admin:not-a-secret@127.0.0.1:6032/' : nil)
    CDO.stubs(:dashboard_db_writer).returns(PROXYSQL_URI)
    CDO.stubs(:db_endpoint_proxy_writer).returns(RDS_PROXY_WRITER)
    CDO.stubs(:db_endpoint_proxy_writer_port).returns(3306)
    CDO.stubs(:db_endpoint_writer).returns(DATABASE_WRITER)
    CDO.stubs(:db_endpoint_writer_port).returns(3306)
    CDO.stubs(:db_credential_writer).returns({'username' => 'writer', 'password' => 'not-a-secret'})
    CDO.stubs(:dashboard_db_name).returns('dashboard_production')
  end

  def test_dashboard_writer_uri_connects_through_proxysql
    stub_endpoints(db_proxy: 'proxysql', proxysql_installed: true)
    assert_equal PROXYSQL_URI, Cdo::Sequel.dashboard_writer_uri
  end

  # ProxySQL is installed by a Chef recipe, so a stack can name it before the recipe has run, or on a host that never
  # runs it at all. Composing its URI anyway would point Sequel at a listener that is not there.
  def test_dashboard_writer_uri_falls_back_when_proxysql_is_not_installed
    stub_endpoints(db_proxy: 'proxysql', proxysql_installed: false)
    assert_equal DATABASE_WRITER, URI.parse(Cdo::Sequel.dashboard_writer_uri).host
  end

  def test_dashboard_writer_uri_connects_through_rds_proxy_from_the_web_application
    stub_endpoints(db_proxy: 'rdsproxy', execution_context: :web_application)
    assert_equal RDS_PROXY_WRITER, URI.parse(Cdo::Sequel.dashboard_writer_uri).host
  end

  # Active Job workers run on the `daemon` instance, which has never had ProxySQL installed, so they have always
  # connected directly to the cluster's writer endpoint.
  def test_dashboard_writer_uri_connects_directly_from_every_other_process
    [nil, :active_job_worker].each do |context|
      stub_endpoints(db_proxy: 'rdsproxy', execution_context: context)
      assert_equal DATABASE_WRITER, URI.parse(Cdo::Sequel.dashboard_writer_uri).host,
        "#{context.inspect} must connect writes directly to the database writer endpoint"
    end
  end

  def test_dashboard_writer_uri_connects_directly_when_no_proxy_is_configured
    [nil, :web_application].each do |context|
      stub_endpoints(db_proxy: 'none', execution_context: context)
      uri = URI.parse(Cdo::Sequel.dashboard_writer_uri)
      assert_equal DATABASE_WRITER, uri.host, "#{context.inspect} must bypass every proxy"
      assert_equal '/dashboard_production', uri.path
      assert_equal 'writer', uri.user
    end
  end

  # Nitro v6 instances drop the server's replies on TCP flows idle for 350s.
  def test_database_connection_pool_expires_connections_before_nitro_idle_timeout
    db = Cdo::Sequel.database_connection_pool('mysql2://root@localhost/dashboard')
    assert_operator db.pool.connection_expiration_timeout, :<, 350
  ensure
    db&.disconnect
  end
end
