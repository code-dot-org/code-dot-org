# frozen_string_literal: true

require_relative 'opentelemetry'
require_relative 'sentry'

module Observability
  class Engine < ::Rails::Engine
    # Require sentry gems here so their Railtie registers before Rails collects
    # all initializers during initialize!. The Engine class body runs when
    # Bundler.require loads the engine in config/application.rb, which is before
    # Rails.application.initialize! is called.
    # Guard on running_web_application? to avoid loading Sentry in rake tasks,
    # migrations, and other non-web processes where setup() will immediately return.
    # sentry-opentelemetry is only needed when both integrations are active.
    if CDO.enable_sentry && CDO.running_web_application?
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
