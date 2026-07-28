require 'json'
require 'request_store'
require 'cdo/http_request_logging'

module Rack
  # Emits one structured request line for each request that lograge did not
  # already log. lograge only sees Rails controller actions; the legacy Sinatra
  # APIs (Files, Channels, NetSim, ...) are mounted as Rack middleware that
  # short-circuit before the Rails router, so without this they would go
  # unlogged. This gives them logging consistent with Rails controllers: the
  # same `@cee: {...}` JSON, the same status-derived severity, and the same
  # DCDO threshold gating (see Cdo::HttpRequestLogging).
  #
  # Insert below RequestStore::Middleware so the store lograge populates deep in
  # ActionController is still readable here on the way out of the request.
  class RequestLogger
    def initialize(app)
      @app = app
    end

    def call(env)
      began = Process.clock_gettime(Process::CLOCK_MONOTONIC)
      status, headers, body = @app.call(env)
      log(env, status, began)
      [status, headers, body]
    rescue Exception => exception # rubocop:disable Lint/RescueException
      # A middleware below us raised past its own error handling. Log it as a
      # 5xx and re-raise so the normal error path (ShowExceptions, Sentry,
      # HoneyBadger) is unaffected.
      log(env, 500, began, exception)
      raise
    end

    private def log(env, status, began, exception = nil)
      # Only complement lograge, in the environments where it runs. Elsewhere
      # (development, unit tests) Rails does its own request logging and lograge
      # never sets LOGGED_KEY, so without this gate we would double-log every
      # controller request.
      return unless Cdo::HttpRequestLogging.enabled?

      # lograge already emitted the line for Rails controller actions.
      return if RequestStore.store[Cdo::HttpRequestLogging::LOGGED_KEY]

      severity = Cdo::HttpRequestLogging.severity_for(status)
      return unless Cdo::HttpRequestLogging.should_log?(severity)

      request = Rack::Request.new(env)
      duration = (Process.clock_gettime(Process::CLOCK_MONOTONIC) - began) * 1000
      data = {
        method: request.request_method,
        path: request.path,
        status: status.to_i,
        duration: duration.round(2),
        request_id: env['action_dispatch.request_id'],
      }.compact

      # Prefer the raised exception; otherwise fall back to one a Sinatra app
      # rescued internally and stashed in env['sinatra.error'].
      exception ||= env['sinatra.error']
      if severity == :error && exception
        data[:error] = "#{exception.class}: #{exception.message}"
        # Copy before filtering: CDO.filter_backtrace mutates in place, and this
        # exception object is also handed to Sentry/HoneyBadger.
        data[:backtrace] = CDO.filter_backtrace(exception.backtrace.map(&:dup)) if exception.backtrace
      end

      CDO.log.public_send(severity, "@cee: #{JSON.dump(data)}")
    end
  end
end
