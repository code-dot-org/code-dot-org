require_relative '../src/env'
require 'rack/test'
require 'minitest/autorun'
require 'webmock/minitest'
require 'mocha/mini_test'

# General purpose Pegasus site tester for incremental test coverage of the Router logic.
class SiteTest < Minitest::Test
  include Rack::Test::Methods

  def app
    Rack::Builder.parse_file(File.absolute_path('../config.ru', __dir__)).first
  end

  def test_post_whitelist
    header 'host', 'code.org'
    # Ensure POST requests to Pegasus template paths return a 405 error by default.
    %w(
      /
      /learn
      /learn/beyond
    ).each do |path|
      assert_equal 405, post(path).status
    end

    # Ensure POST requests to whitelisted paths are allowed.
    assert_equal 200, post('/custom-certificates').status
  end

  module ::NewRelic
    class Agent
      def self.set_transaction_name(name)
      end
    end
  end

  def test_new_relic_transactions
    header 'host', 'code.org'
    ::NewRelic::Agent.expects(:set_transaction_name).with('/')
    assert_equal 200, get('/').status

    ::NewRelic::Agent.expects(:set_transaction_name).with('/learn')
    assert_equal 200, get('/learn').status

    # Ensure dynamic splat info is removed from the transaction name.
    # Splat paths can include session IDs, usernames, etc that don't collapse into a single transaction.
    ::NewRelic::Agent.expects(:set_transaction_name).with('/donate')
    assert_equal 302, get('/donate/hello-world').status
  end
end
