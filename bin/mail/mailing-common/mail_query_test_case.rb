require_relative '../../../pegasus/src/env'
require src_dir 'database'
require 'minitest/autorun'

# Encapsulate Sql test cases in a rollback transaction.
# Adapted from http://sequel.jeremyevans.net/rdoc/files/doc/testing_rdoc.html

# Use this class as the base class for your tests
class MailQueryTestCase < Minitest::Test
  def run(*args, &block)
    Sequel.transaction([DB, DASHBOARD_DB], :rollback=>:always){super}
    self
  end
end
