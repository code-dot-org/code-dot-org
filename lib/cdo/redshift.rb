# WARNING: This is explicitly not included in our root Gemfile for the reasons discussed in the PR
# https://github.com/code-dot-org/code-dot-org/pull/14056. A separate gemfile should be created for
# any scripts needing usage of this client and loaded via RakeUtils.with_bundle_dir.
# @example:
#   RakeUtils.with_bundle_dir(File.dirname(__FILE__)) do
#     require 'cdo/redshift'
#   end

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
    @conn = PGconn.new(CDO.redshift_host, port, options, tty, dbname, login, CDO.redshift_password)
  end

  def exec(sql_query)
    @conn.exec(sql)
  end
end
