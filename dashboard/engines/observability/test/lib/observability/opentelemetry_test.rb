# frozen_string_literal: true

require 'test_helper'

describe Observability::OpenTelemetry do
  before do
    CDO.stubs(:enable_opentelemetry).returns(false)
    # ENV['UNIT_TEST'] is nil in engine test runs — enabled path is active by default
  end

  describe '.setup' do
    describe 'when CDO.enable_opentelemetry is false' do
      it 'returns without configuring the SDK' do
        _(Observability::OpenTelemetry.setup).must_be_nil
      end
    end

    describe 'when UNIT_TEST is set' do
      before do
        CDO.stubs(:enable_opentelemetry).returns(true)
        ENV['UNIT_TEST'] = 'true'
      end
      after {ENV.delete('UNIT_TEST')}

      it 'returns without configuring the SDK' do
        _(Observability::OpenTelemetry.setup).must_be_nil
      end
    end

    describe 'when both CDO.enable_opentelemetry is true and UNIT_TEST is not set' do
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
