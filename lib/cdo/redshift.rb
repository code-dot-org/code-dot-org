# WARNING: This is explicitly not included in our Gemfile for the reasons discussed in the PR
# https://github.com/code-dot-org/code-dot-org/pull/14056. The PG gem should be manually installed
# on any machines making use of this client.
require 'pg'

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
    @conn = PGconn.new(CDO.redshift_host, port, options, tty, dbname, login, CDO.redshift_password)
  end

  def exec(sql_query)
    @conn.exec(sql)
  end
end
