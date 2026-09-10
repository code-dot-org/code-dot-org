require_relative '../../test_helper'
require 'json'
require 'request_store'
require 'cdo/rack/request_logger'

describe Rack::RequestLogger do
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

  let(:logger) {CapturingLogger.new}
  let(:downstream_status) {200}
  let(:downstream) {->(_env) {[downstream_status, {}, ['ok']]}}
  let(:middleware) {Rack::RequestLogger.new(downstream)}

  before do
    RequestStore.clear!
    @original_log = CDO.log
    CDO.log = logger
    # On, and logging every severity, unless a test overrides these.
    Cdo::HttpRequestLogging.stubs(:enabled?).returns(true)
    Cdo::HttpRequestLogging.stubs(:threshold).returns(:info)
  end

  after do
    CDO.log = @original_log
    RequestStore.clear!
  end

  def env_for(path = '/projects/1', method: 'GET')
    Rack::MockRequest.env_for(path, method: method).merge('action_dispatch.request_id' => 'abc-123')
  end

  # The single logged line, parsed from its @cee JSON.
  def logged
    _(logger.entries.size).must_equal 1
    severity, message = logger.entries.first
    _(message).must_match(/\A@cee: /)
    [severity, JSON.parse(message.sub('@cee: ', ''))]
  end

  it 'returns the downstream response unchanged' do
    status, _headers, body = middleware.call(env_for)
    _(status).must_equal 200
    _(body).must_equal ['ok']
  end

  it 'logs a non-controller request at info with request fields' do
    middleware.call(env_for('/projects/7', method: 'POST'))
    severity, data = logged
    _(severity).must_equal :info
    _(data['method']).must_equal 'POST'
    _(data['path']).must_equal '/projects/7'
    _(data['status']).must_equal 200
    _(data['request_id']).must_equal 'abc-123'
    _(data).must_include 'duration'
  end

  it 'does not log a request lograge already claimed' do
    RequestStore.store[Cdo::HttpRequestLogging::LOGGED_KEY] = true
    middleware.call(env_for)
    _(logger.entries).must_be_empty
  end

  it 'does nothing when request logging is disabled' do
    Cdo::HttpRequestLogging.stubs(:enabled?).returns(false)
    middleware.call(env_for)
    _(logger.entries).must_be_empty
  end

  it 'logs a 4xx response at warn' do
    stubbed = Rack::RequestLogger.new(->(_env) {[404, {}, ['nope']]})
    stubbed.call(env_for)
    severity, data = logged
    _(severity).must_equal :warn
    _(data['status']).must_equal 404
  end

  it 'logs a 5xx response at error' do
    stubbed = Rack::RequestLogger.new(->(_env) {[500, {}, ['boom']]})
    stubbed.call(env_for)
    severity, data = logged
    _(severity).must_equal :error
    _(data['status']).must_equal 500
    _(data).wont_include 'backtrace' # no exception available for a plain 500 response
  end

  it 'drops sub-threshold lines' do
    Cdo::HttpRequestLogging.stubs(:threshold).returns(:warn)
    middleware.call(env_for) # 200 -> info, below :warn
    _(logger.entries).must_be_empty
  end

  describe 'when a downstream middleware raises' do
    let(:boom) {RuntimeError.new('kaboom')}
    let(:downstream) {->(_env) {raise boom}}

    it 'logs the error and re-raises, without a backtrace' do
      error = assert_raises(RuntimeError) {middleware.call(env_for)}
      _(error).must_equal boom

      severity, data = logged
      _(severity).must_equal :error
      _(data['status']).must_equal 500
      _(data['error']).must_equal 'RuntimeError: kaboom'
      _(data).wont_include 'backtrace'
    end
  end

  it 'records a Sinatra-rescued exception in the error field on a 5xx response' do
    error = RuntimeError.new('sinatra failed')
    app = Rack::RequestLogger.new(->(env) {env['sinatra.error'] = error; [500, {}, ['err']]})
    app.call(env_for)
    severity, data = logged
    _(severity).must_equal :error
    _(data['error']).must_equal 'RuntimeError: sinatra failed'
    _(data).wont_include 'backtrace'
  end
end
