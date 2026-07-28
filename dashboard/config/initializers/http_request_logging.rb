# Make lograge's per-request line reflect the response status: 5xx logs at
# :error (with a backtrace), 4xx at :warn, 2xx/3xx at :info, and lines below the
# DCDO `http_request_log_level` threshold are dropped. See Cdo::HttpRequestLogging
# and docs/log-formats.md.
#
# Only relevant when lograge is enabled (production, staging, adhoc, managed
# test). When it is disabled the subscriber is never attached and these prepends
# sit inert.
require 'request_store'
require 'cdo/http_request_logging'

module Cdo
  # Replaces lograge's fixed-severity, always-emit logging with the status-based
  # policy above. Prepended onto Lograge::RequestLogSubscriber (whose
  # process_exception is an alias of process_action, so this covers both).
  module LogragePerRequestSeverity
    def process_action(event)
      return if Lograge.ignore?(event)
      # Dedupe: a raising action fires both process_action (with the exception)
      # and, via the fork's DebugExceptions hook, process_exception. Log once.
      return if RequestStore.store[Cdo::HttpRequestLogging::LOGGED_KEY]

      payload = event.payload
      data = send(:extract_request, event, payload)
      data = send(:before_format, data, payload)

      # Claim the request even when dropped below threshold: lograge, not
      # Rack::RequestLogger, owns the line for controller actions.
      RequestStore.store[Cdo::HttpRequestLogging::LOGGED_KEY] = true

      severity = Cdo::HttpRequestLogging.severity_for(data[:status])
      return unless Cdo::HttpRequestLogging.should_log?(severity)

      if severity == :error
        exception = payload[:exception_object] ||
          RequestStore.store[Cdo::HttpRequestLogging::EXCEPTION_KEY]
        # Copy before filtering: CDO.filter_backtrace mutates in place and the
        # same exception is reported to Sentry/HoneyBadger.
        data[:backtrace] = CDO.filter_backtrace(exception.backtrace.map(&:dup)) if exception&.backtrace
      end

      logger.public_send(severity, Lograge.formatter.call(data))
    end
  end

  # The fork's Lograge::DebugExceptions notifies process_exception with a payload
  # holding only [class, message] - no exception object, so no backtrace is
  # reachable from the subscriber. Stash the object here first so the subscriber
  # can attach a backtrace for those 5xx lines too.
  module CaptureRequestException
    def log_error(request, wrapper)
      RequestStore.store[Cdo::HttpRequestLogging::EXCEPTION_KEY] = wrapper.exception
      super
    end
  end
end

Lograge::RequestLogSubscriber.prepend(Cdo::LogragePerRequestSeverity)

# Register after lograge's own after_initialize so Cdo::CaptureRequestException
# lands ahead of Lograge::DebugExceptions in the ancestor chain and runs first,
# storing the exception before lograge notifies process_exception.
Rails.application.config.after_initialize do
  if Rails.application.config.lograge.enabled
    ActionDispatch::DebugExceptions.prepend(Cdo::CaptureRequestException)
  end
end
