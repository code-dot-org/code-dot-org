require 'test_helper'
require 'request_store'

# Exercises the lograge override installed by
# config/initializers/http_request_logging.rb. lograge is disabled in unit tests
# (so its subscriber is never attached to live requests), but the initializer
# still prepends Cdo::LogragePerRequestSeverity onto the subscriber class at load
# time, so we can drive its process_action and process_exception directly with
# synthetic events.
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

  def event(status:)
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
    Struct.new(:payload, :duration).new(payload, 12.34)
  end

  # Mirrors the payload lograge's process_exception path delivers: no :status,
  # an :exception [class, message] pair from which lograge derives the status
  # and its own `error` field.
  def exception_event(exception_class: 'RuntimeError', message: 'boom')
    payload = {
      method: 'POST',
      path: '/dashboardapi/x',
      format: :json,
      controller: nil,
      action: nil,
      exception: [exception_class, message],
    }
    Struct.new(:payload, :duration).new(payload, 0.0)
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

  test 'logs 5xx at error without a backtrace' do
    @subscriber.process_action(event(status: 500))
    severity, data = only_entry
    assert_equal :error, severity
    assert_equal 500, data['status']
    refute data.key?('backtrace')
  end

  test "keeps lograge's error field on the exception path and adds no backtrace" do
    @subscriber.process_action(exception_event(message: "Can't verify CSRF token authenticity."))
    severity, data = only_entry
    assert_equal :error, severity
    assert_equal 500, data['status']
    assert_equal "RuntimeError: Can't verify CSRF token authenticity.", data['error']
    refute data.key?('backtrace')
  end

  test 'routes process_exception through the override, not stock lograge' do
    # Regression guard: lograge binds process_exception to the original
    # process_action via `alias` at class-definition time, so a prepend that
    # overrides only process_action would leave this event logging at stock
    # :info. It must instead pick up our status-derived severity.
    @subscriber.process_exception(exception_event(message: 'kaboom'))
    severity, data = only_entry
    assert_equal :error, severity
    assert_equal 500, data['status']
    assert_equal 'RuntimeError: kaboom', data['error']
  end

  test 'drops sub-threshold lines but still claims the request' do
    Cdo::HttpRequestLogging.stubs(:threshold).returns(:warn)
    @subscriber.process_action(event(status: 200)) # info, below warn
    assert_empty @logger.entries
    assert RequestStore.store[Cdo::HttpRequestLogging::LOGGED_KEY]
  end

  test 'logs each request once across the process_action/process_exception pair' do
    # A raising action fires process_action first, then process_exception via
    # the DebugExceptions hook. The second delivery must be deduped, not logged
    # a second time.
    @subscriber.process_action(event(status: 500))
    @subscriber.process_exception(exception_event(message: 'boom'))
    assert_equal 1, @logger.entries.size
  end
end
