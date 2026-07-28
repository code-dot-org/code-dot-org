require 'logger'
require 'dynamic_config/dcdo'

module Cdo
  # Policy shared by the two producers of the one-line-per-HTTP-request log: the
  # lograge initializer for Rails controller actions
  # (dashboard/config/initializers/http_request_logging.rb) and
  # Rack::RequestLogger for the legacy Sinatra APIs mounted as Rack middleware
  # (lib/cdo/rack/request_logger.rb). The line's severity is derived from the
  # response status, and lines below a configurable threshold are dropped so we
  # do not pay to ship 2xx/3xx request logs to CloudWatch in production.
  #
  #   5xx  -> :error
  #   4xx  -> :warn
  #   else -> :info
  #
  # The threshold is read from the DCDO key `http_request_log_level`, so it can
  # be lowered to :info during an incident to get full request logging without a
  # deploy. Its default is :warn in production (drop 2xx/3xx) and :info in every
  # other environment (keep everything; control cost with log retention instead).
  #
  # See docs/log-formats.md - Rails Application Logs for the emitted format.
  module HttpRequestLogging
    DCDO_KEY = 'http_request_log_level'.freeze

    # LOGGED_KEY marks a request lograge has logged, so Rack::RequestLogger does
    # not log it a second time and lograge's own process_action/process_exception
    # pair (a raising action delivers both) logs only once.
    LOGGED_KEY = :http_request_logged

    # Ordered lowest-to-highest so a threshold comparison is a simple >=.
    SEVERITY = {info: Logger::INFO, warn: Logger::WARN, error: Logger::ERROR}.freeze

    class << self
      # Severity for a response status code.
      def severity_for(status)
        status = status.to_i
        return :error if status >= 500
        return :warn if status >= 400
        :info
      end

      # Minimum severity a request line must reach to be emitted.
      def threshold
        level = DCDO.get(DCDO_KEY, default_threshold).to_s.downcase.to_sym
        SEVERITY.key?(level) ? level : default_threshold
      end

      def should_log?(severity)
        SEVERITY.fetch(severity, Logger::UNKNOWN) >= SEVERITY.fetch(threshold)
      end

      def default_threshold
        CDO.rack_env?(:production) ? :warn : :info
      end

      # Whether request logging is active. Tied to lograge: Rack::RequestLogger
      # complements lograge for the legacy APIs, so it should run in exactly the
      # environments lograge does (production, staging, adhoc, managed test) and
      # stay quiet where Rails does its own request logging (development, unit
      # tests). Read at request time; config.lograge.enabled is set per env.
      def enabled?
        return false unless defined?(Rails) && Rails.respond_to?(:application)
        app = Rails.application
        !!(app && app.config.lograge.enabled)
      end
    end
  end
end
