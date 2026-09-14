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
end
