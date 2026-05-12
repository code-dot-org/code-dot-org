# frozen_string_literal: true

module Observability
  module Errors
    def self.capture_exception(exception, **options, &block)
      return unless Sentry.enabled? && defined?(::Sentry)

      ::Sentry.capture_exception(exception, **options, &block)
    end

    def self.capture_message(message, **options, &block)
      return unless Sentry.enabled? && defined?(::Sentry)

      ::Sentry.capture_message(message, **options, &block)
    end
  end
end
