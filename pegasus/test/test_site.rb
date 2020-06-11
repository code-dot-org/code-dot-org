require_relative './test_helper'

# General purpose Pegasus site tester for incremental test coverage of the Router logic.
class SiteTest < Minitest::Test
  include Rack::Test::Methods

  def app
    Rack::Builder.parse_file(File.absolute_path('../config.ru', __dir__)).first
  end

  def test_post_allowlist
    header 'host', 'code.org'
    # Ensure POST requests to Pegasus template paths return a 405 error by default.
    %w(
      /
      /learn
      /learn/beyond
    ).each do |path|
      assert_equal 405, post(path).status
    end
  end

  def test_get_list
    header 'host', 'code.org'

    # Ensure GET requests to valid paths are allowed.
    %w(
      /
      /curriculum/6-8
      /curriculum/6-8/1
      /curriculum/unplugged/css/jumbotron-banner.css
    ).each do |path|
      assert_equal 200, get(path).status
    end

    # Ensure GET requests to invalid paths return a 404 error.
    %w(
      /curriculum/6-8/missing
    ).each do |path|
      assert_equal 404, get(path).status
    end
  end

  module ::NewRelic
    class Agent
      def self.set_transaction_name(name)
      end
    end
  end

  def test_new_relic_transactions
    # Disable cache for requests in this test.
    env 'rack-cache.allow_reload', true
    header 'cache-control', 'no-cache'

    header 'host', 'code.org'

    assert_equal 200, get('/').status

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
