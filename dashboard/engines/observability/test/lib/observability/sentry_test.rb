# frozen_string_literal: true

require 'test_helper'
require_relative '../../../app/controllers/concerns/observability/sentry/user_context'

describe Observability::Sentry do
  before do
    CDO.enable_sentry = false
    CDO.enable_opentelemetry = false
    CDO.running_web_application = false
    CDO.dashboard_sentry_dsn = nil
  end

  describe '.setup' do
    describe 'when CDO.enable_sentry is false' do
      it 'returns without initializing Sentry' do
        _(Observability::Sentry.setup).must_be_nil
      end
    end

    describe 'when CDO.running_web_application? is false' do
      before {CDO.enable_sentry = true}

      it 'returns without initializing Sentry' do
        _(Observability::Sentry.setup).must_be_nil
      end
    end

    describe 'when CDO.enable_sentry is true and running_web_application? is true' do
      before do
        CDO.enable_sentry = true
        CDO.running_web_application = true
        CDO.dashboard_sentry_dsn = 'https://key@sentry.example.com/1'
      end

      describe 'when dashboard_sentry_dsn is blank' do
        before {CDO.dashboard_sentry_dsn = nil}

        it 'does not initialize Sentry' do
          Sentry.expects(:init).never
          Observability::Sentry.setup
        end
      end

      it 'initializes Sentry' do
        Sentry.expects(:init).once
        Observability::Sentry.setup
      end

      it 'sets the DSN from CDO config' do
        mock_config = stub_everything('sentry_config')
        mock_config.expects(:dsn=).with('https://key@sentry.example.com/1')
        Sentry.expects(:init).yields(mock_config)
        Observability::Sentry.setup
      end

      describe 'when CDO.enable_opentelemetry is false' do
        it 'does not configure the OTLP integration' do
          mock_config = stub_everything('sentry_config')
          mock_config.expects(:otlp).never
          Sentry.expects(:init).yields(mock_config)
          Observability::Sentry.setup
        end
      end

      describe 'when CDO.enable_opentelemetry is true' do
        before {CDO.enable_opentelemetry = true}

        it 'enables the OTLP integration and defers exporting and propagation to the collector' do
          mock_otlp = mock('otlp_config')
          mock_otlp.expects(:enabled=).with(true)
          mock_otlp.expects(:setup_otlp_traces_exporter=).with(false)
          mock_otlp.expects(:setup_propagator=).with(false)
          mock_config = stub_everything('sentry_config')
          mock_config.stubs(:otlp).returns(mock_otlp)
          Sentry.expects(:init).yields(mock_config)
          Observability::Sentry.setup
        end
      end
    end
  end
end

describe Observability::Sentry::UserContext do
  before do
    # This engine test runs without the dashboard application's ApplicationController.
    # rubocop:disable Rails/ApplicationController
    @controller_class = Class.new(ActionController::Base) do
      include Observability::Sentry::UserContext
    end
    # rubocop:enable Rails/ApplicationController
    @controller = @controller_class.new
    @controller.stubs(:devise_controller?).returns(false)
  end

  it 'registers set_user_context as a before_action' do
    before_action_filters = @controller_class._process_action_callbacks.select do |callback|
      callback.kind == :before
    end.map(&:filter)

    _(before_action_filters).must_include :set_user_context
  end

  it 'sets the Sentry user from current_user on authenticated requests' do
    user = stub(id: SecureRandom.random_number(1..1000))
    warden = mock('warden')
    warden.expects(:authenticated?).with(:user).returns(true)
    @controller.stubs(:request).returns(stub(env: {'warden' => warden}))
    @controller.stubs(:current_user).returns(user)

    Sentry.expects(:set_user).with(id: user.id)

    @controller.send(:set_user_context)
  end

  it 'does not set the Sentry user when the request is not authenticated' do
    warden = mock('warden')
    warden.expects(:authenticated?).with(:user).returns(false)
    @controller.stubs(:request).returns(stub(env: {'warden' => warden}))
    @controller.expects(:current_user).never

    Sentry.expects(:set_user).never

    @controller.send(:set_user_context)
  end

  it 'does not set the Sentry user when warden is unavailable' do
    @controller.stubs(:request).returns(stub(env: {}))
    @controller.expects(:current_user).never

    Sentry.expects(:set_user).never

    @controller.send(:set_user_context)
  end

  it 'does not set the Sentry user on signed-out Devise requests' do
    warden = mock('warden')
    warden.expects(:authenticated?).with(:user).returns(false)
    @controller.stubs(:request).returns(stub(env: {'warden' => warden}))
    @controller.stubs(:devise_controller?).returns(true)
    @controller.expects(:current_user).never

    Sentry.expects(:set_user).never

    @controller.send(:set_user_context)
  end

  it 'does not set the Sentry user on Devise session create' do
    @controller.stubs(:action_name).returns('create')
    @controller.stubs(:controller_name).returns('sessions')
    @controller.expects(:current_user).never

    Sentry.expects(:set_user).never

    @controller.send(:set_user_context)
  end
end
