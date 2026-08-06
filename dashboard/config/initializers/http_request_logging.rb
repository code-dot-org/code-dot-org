# Make lograge's per-request line reflect the response status: 5xx logs at
# :error, 4xx at :warn, 2xx/3xx at :info, and lines below the DCDO
# `http_request_log_level` threshold are dropped. See Cdo::HttpRequestLogging
# and docs/log-formats.md.
#
# The line still carries lograge's own `error` field ("<class>: <message>") for
# failed requests; the exception's backtrace is not logged here, since Sentry
# and Honeybadger already capture it.
#
# Only relevant when lograge is enabled (production, staging, adhoc, managed
# test). When it is disabled, the subscriber is never attached and this prepend
# sits inert.
require 'request_store'
require 'cdo/http_request_logging'

module Cdo
  # Replaces lograge's fixed-severity, always-emit logging with the status-based
  # policy above. Prepended onto Lograge::RequestLogSubscriber.
  #
  # The subscriber handles two events: process_action.action_controller for a
  # request that completes, and process_exception.action_controller (via the
  # lograge fork's DebugExceptions hook) for one whose exception reaches the
  # DebugExceptions middleware.
  module LogragePerRequestSeverity
    def process_action(event)
      return if Lograge.ignore?(event)
      # Dedupe: a raising action fires both process_action and, via the fork's
      # DebugExceptions hook, process_exception. Log once.
      return if RequestStore.store[Cdo::HttpRequestLogging::LOGGED_KEY]

      payload = event.payload
      data = send(:extract_request, event, payload)
      data = send(:before_format, data, payload)
      RequestStore.store[Cdo::HttpRequestLogging::LOGGED_KEY] = true

      severity = Cdo::HttpRequestLogging.severity_for(data[:status])
      return unless Cdo::HttpRequestLogging.should_log?(severity)

      logger.public_send(severity, Lograge.formatter.call(data))
    end

    def process_exception(event)
      process_action(event)
    end
  end
end

Lograge::RequestLogSubscriber.prepend(Cdo::LogragePerRequestSeverity)
