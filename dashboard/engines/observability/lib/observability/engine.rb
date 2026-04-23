# frozen_string_literal: true

require_relative 'opentelemetry'
require_relative 'sentry'

module Observability
  class Engine < ::Rails::Engine
    # Require sentry gems here so their Railtie registers before Rails collects
    # all initializers during initialize!. The Engine class body runs when
    # Bundler.require loads the engine in config/application.rb, which is before
    # Rails.application.initialize! is called.
    # Skip in unit test runs where the DSN is unconfigured and background
    # threads are unwanted. All other processes (workers, cron, rake, console)
    # get observability. sentry-opentelemetry is only needed when both
    # integrations are active.
    if CDO.enable_sentry && !CDO.unit_test
      require 'sentry-ruby'
      require 'sentry-rails'
      require 'sentry-opentelemetry' if CDO.enable_opentelemetry
    end

    initializer 'observability.opentelemetry' do
      Observability::OpenTelemetry.setup
    end

    initializer 'observability.sentry', after: 'observability.opentelemetry' do
      Observability::Sentry.setup
    end
  end
end
