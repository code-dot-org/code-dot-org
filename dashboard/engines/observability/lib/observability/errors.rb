# frozen_string_literal: true

# Required directly by non-Rails processes (root lib/, rake, standalone scripts),
# so pull in only the Sentry gate and never the engine.
require_relative 'sentry'

module Observability
  module Errors
    # Keys Honeybadger reads as notice fields rather than user data. Sentry has
    # no equivalent, so they ride along in the extras.
    HONEYBADGER_NOTICE_KEYS = %i[error_class error_message].freeze

    # The single way house code reports a handled error. Unhandled exceptions
    # keep reaching both vendors through their own middleware.
    #
    # Takes an exception, a message string, or neither when the options carry
    # error_class/error_message. Options go to Honeybadger verbatim so notice
    # titles and grouping match what direct Honeybadger.notify calls produced.
    # Returns the Sentry event, which callers use for its event_id.
    def self.report(error_or_message = nil, **options)
      notify_honeybadger(error_or_message, options)
      capture_with_sentry(error_or_message, options)
    end

    private_class_method def self.notify_honeybadger(error_or_message, options)
      return unless defined?(::Honeybadger)

      # Honeybadger builds the notice from a bare options hash when there is no
      # exception or message to lead with.
      return ::Honeybadger.notify(options) if error_or_message.nil?

      ::Honeybadger.notify(error_or_message, **options)
    end

    private_class_method def self.capture_with_sentry(error_or_message, options)
      return unless Sentry.enabled? && defined?(::Sentry)

      extra = options.fetch(:context, {}).merge(options.slice(*HONEYBADGER_NOTICE_KEYS))
      return ::Sentry.capture_exception(error_or_message, extra: extra) if error_or_message.is_a?(Exception)

      message = error_or_message || options[:error_message]
      ::Sentry.capture_message(message.to_s, extra: extra) if message
    end
  end
end
