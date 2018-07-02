require_relative '../src/env'
require src_dir 'database'
require 'minitest/autorun'

# Encapsulate Sql test cases in a rollback transaction.
# Adapted from http://sequel.jeremyevans.net/rdoc/files/doc/testing_rdoc.html

# Use this class as the base class for your tests
class SequelTestCase < Minitest::Test
  def run(*args, &block)
    result = nil
    Sequel::Model.db.transaction(rollback: :always, auto_savepoint: true) {result = super}
    result
  end
end
