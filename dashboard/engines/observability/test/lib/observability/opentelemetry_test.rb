# frozen_string_literal: true

require 'test_helper'
# opentelemetry-sdk is not auto-required during Rails boot (the require lives inside
# Observability::OpenTelemetry.setup, gated by running_web_application?). Pre-require
# it here so constants are available for stubbing regardless of which test_helper
# is on the load path.
require 'opentelemetry-sdk'

describe Observability::OpenTelemetry do
  before do
    CDO.stubs(:enable_opentelemetry).returns(false)
    # CDO.unit_test proxies ENV['UNIT_TEST'], which dashboard's test_helper.rb
    # sets to disable observability during unit tests. Stub it to false so the
    # enabled code path is exercised; the disabled-path describe block overrides.
    CDO.stubs(:unit_test).returns(false)
  end

  describe '.setup' do
    describe 'when CDO.enable_opentelemetry is false' do
      it 'returns without configuring the SDK' do
        _(Observability::OpenTelemetry.setup).must_be_nil
      end
    end

    describe 'when CDO.unit_test is true' do
      before do
        CDO.stubs(:enable_opentelemetry).returns(true)
        CDO.stubs(:unit_test).returns(true)
      end

      it 'returns without configuring the SDK' do
        _(Observability::OpenTelemetry.setup).must_be_nil
      end
    end

    describe 'when CDO.enable_opentelemetry is true and CDO.unit_test is false' do
      before do
        CDO.stubs(:enable_opentelemetry).returns(true)
        OpenTelemetry::SDK.stubs(:configure)
      end

      it 'configures the OpenTelemetry SDK' do
        OpenTelemetry::SDK.expects(:configure).once
        Observability::OpenTelemetry.setup
      end

      it 'sets the service name to dashboard' do
        fake_config = mock('otel_config')
        fake_config.expects(:service_name=).with('dashboard')
        fake_config.stubs(:use_all)
        fake_config.stubs(:add_span_processor)
        OpenTelemetry::SDK.expects(:configure).yields(fake_config)
        Observability::OpenTelemetry.setup
      end

      describe 'OTEL_TRACES_SAMPLER' do
        after {ENV.delete('OTEL_TRACES_SAMPLER')}

        it 'sets OTEL_TRACES_SAMPLER to always_on' do
          ENV.delete('OTEL_TRACES_SAMPLER')
          Observability::OpenTelemetry.setup
          _(ENV.fetch('OTEL_TRACES_SAMPLER', nil)).must_equal 'always_on'
        end

        it 'does not override an existing OTEL_TRACES_SAMPLER' do
          ENV['OTEL_TRACES_SAMPLER'] = 'parentbased_always_on'
          Observability::OpenTelemetry.setup
          _(ENV.fetch('OTEL_TRACES_SAMPLER', nil)).must_equal 'parentbased_always_on'
        end
      end

      describe 'OTEL_LOG_LEVEL' do
        after {ENV.delete('OTEL_LOG_LEVEL')}

        it 'sets OTEL_LOG_LEVEL to fatal' do
          ENV.delete('OTEL_LOG_LEVEL')
          Observability::OpenTelemetry.setup
          _(ENV.fetch('OTEL_LOG_LEVEL', nil)).must_equal 'fatal'
        end

        it 'does not override an existing OTEL_LOG_LEVEL' do
          ENV['OTEL_LOG_LEVEL'] = 'debug'
          Observability::OpenTelemetry.setup
          _(ENV.fetch('OTEL_LOG_LEVEL', nil)).must_equal 'debug'
        end
      end
    end
  end
end
