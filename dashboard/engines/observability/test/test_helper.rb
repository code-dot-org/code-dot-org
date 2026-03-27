# frozen_string_literal: true

ENV['RACK_ENV'] ||= 'test'
ENV['RAILS_ENV'] ||= 'test'

require 'bundler/setup'
require 'logger'
require 'rails'
require 'rails/test_help'
require 'minitest/autorun'
require 'minitest/spec'
require 'mocha/minitest'

# Pre-require observability gems so their constants are available for stubbing
# in the enabled test cases.
require 'opentelemetry-sdk'
require 'sentry-ruby'

# Stub the CDO global config object referenced by both setup modules.
# All flags default to false so nothing activates accidentally.
# Individual tests set the values they need in before blocks.
module CDO
  class << self
    attr_accessor :enable_opentelemetry, :enable_sentry, :dashboard_sentry_dsn, :frontend_apps_sentry_dsn, :frontend_studio_sentry_dsn

    def running_web_application?
      @running_web_application
    end

    attr_writer :running_web_application

    def log
      @log ||= Logger.new(IO::NULL)
    end
  end

  self.enable_opentelemetry = false
  self.enable_sentry = false
  self.dashboard_sentry_dsn = nil
  self.frontend_apps_sentry_dsn = nil
  self.frontend_studio_sentry_dsn = nil
  self.running_web_application = false
end

require 'observability'
