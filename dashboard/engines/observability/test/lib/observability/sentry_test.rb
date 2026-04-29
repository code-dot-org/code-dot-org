# frozen_string_literal: true

require 'test_helper'
# sentry-ruby is not auto-required during Rails boot (the require lives inside
# Observability::Sentry.setup, gated by running_web_application?). Pre-require
# it here so the Sentry constant is available for stubbing.
require 'sentry-ruby'

describe Observability::Sentry do
  before do
    CDO.stubs(:enable_sentry).returns(false)
    CDO.stubs(:enable_opentelemetry).returns(false)
    CDO.stubs(:dashboard_sentry_dsn).returns(nil)
    CDO.stubs(:unit_test).returns(false)
  end

  describe '.setup' do
    describe 'when CDO.enable_sentry is false' do
      it 'returns without initializing Sentry' do
        _(Observability::Sentry.setup).must_be_nil
      end
    end

    describe 'when CDO.unit_test is true' do
      before do
        CDO.stubs(:enable_sentry).returns(true)
        CDO.stubs(:unit_test).returns(true)
      end

      it 'returns without initializing Sentry' do
        _(Observability::Sentry.setup).must_be_nil
      end
    end

    describe 'when CDO.enable_sentry is true and CDO.unit_test is false' do
      before do
        CDO.stubs(:enable_sentry).returns(true)
        CDO.stubs(:dashboard_sentry_dsn).returns('https://key@sentry.example.com/1')
      end

      describe 'when dashboard_sentry_dsn is blank' do
        before {CDO.stubs(:dashboard_sentry_dsn).returns(nil)}

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
        before {CDO.stubs(:enable_opentelemetry).returns(true)}

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
