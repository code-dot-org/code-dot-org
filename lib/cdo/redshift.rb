require 'pg'
require 'singleton'

# A thin wrapper around PG, providing a mechanism to execute SQL commands on our AWS Redshift
# instance.
class RedshiftClient
  include Singleton

  def initialize
    port = 5439
    options = ''
    tty = ''
    dbname = 'dashboard'
    login = 'dev'
    @conn = PG::Connection.new(CDO.redshift_host, port, options, tty, dbname, login, CDO.redshift_password)
  end

  def exec(sql_query)
    @conn.exec(sql_query)
  end
end
