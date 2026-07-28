require 'test_helper'
require 'request_store'

# Exercises the lograge override installed by
# config/initializers/http_request_logging.rb. lograge is disabled in unit tests
# (so its subscriber is never attached to live requests), but the initializer
# still prepends Cdo::LogragePerRequestSeverity onto the subscriber class at load
# time, so we can drive its process_action directly with a synthetic event.
class HttpRequestLoggingTest < ActiveSupport::TestCase
  # Records (severity, message) pairs in place of the real syslog logger.
  class CapturingLogger
    attr_reader :entries

    def initialize
      @entries = []
    end

    %i[info warn error].each do |severity|
      define_method(severity) {|message| @entries << [severity, message]}
    end
  end

  setup do
    RequestStore.clear!
    @subscriber = Lograge::RequestLogSubscriber.new
    @logger = CapturingLogger.new
    @subscriber.stubs(:logger).returns(@logger)
    Lograge.stubs(:ignore?).returns(false)
    @original_formatter = Lograge.formatter
    Lograge.formatter = Lograge::Formatters::Cee.new
    Cdo::HttpRequestLogging.stubs(:threshold).returns(:info)
  end

  teardown do
    Lograge.formatter = @original_formatter
    RequestStore.clear!
  end

  def event(status:, exception_object: nil)
    payload = {
      method: 'GET',
      path: '/dashboardapi/x',
      format: :json,
      controller: 'Api::FooController',
      action: 'show',
      status: status,
      view_runtime: 1.0,
      db_runtime: 2.0,
    }
    payload[:exception_object] = exception_object if exception_object
    Struct.new(:payload, :duration).new(payload, 12.34)
  end

  def only_entry
    assert_equal 1, @logger.entries.size
    severity, message = @logger.entries.first
    assert_match(/\A@cee: /, message)
    [severity, JSON.parse(message.sub('@cee: ', ''))]
  end

  test 'logs 2xx at info' do
    @subscriber.process_action(event(status: 200))
    severity, data = only_entry
    assert_equal :info, severity
    assert_equal 200, data['status']
    assert_equal 'Api::FooController', data['controller']
  end

  test 'logs 4xx at warn' do
    @subscriber.process_action(event(status: 404))
    severity, = only_entry
    assert_equal :warn, severity
  end

  test 'logs 5xx at error with a backtrace when an exception is available' do
    exception = begin
      raise 'boom'
    rescue RuntimeError => exception
      exception
    end
    @subscriber.process_action(event(status: 500, exception_object: exception))
    severity, data = only_entry
    assert_equal :error, severity
    assert data['backtrace'].is_a?(String)
  end

  test 'does not mutate the exception backtrace shared with error reporters' do
    exception = begin
      raise 'boom'
    rescue RuntimeError => exception
      exception
    end
    original = exception.backtrace.dup
    @subscriber.process_action(event(status: 500, exception_object: exception))
    assert_equal original, exception.backtrace
  end

  test 'drops sub-threshold lines but still claims the request' do
    Cdo::HttpRequestLogging.stubs(:threshold).returns(:warn)
    @subscriber.process_action(event(status: 200)) # info, below warn
    assert_empty @logger.entries
    assert RequestStore.store[Cdo::HttpRequestLogging::LOGGED_KEY]
  end

  test 'logs each request only once across process_action and process_exception' do
    @subscriber.process_action(event(status: 500))
    # process_exception is an alias; a second delivery for the same request
    # must not produce a second line.
    @subscriber.process_action(event(status: 500))
    assert_equal 1, @logger.entries.size
  end

  test 'marks the request logged so Rack::RequestLogger skips it' do
    @subscriber.process_action(event(status: 200))
    assert RequestStore.store[Cdo::HttpRequestLogging::LOGGED_KEY]
  end
end
