# frozen_string_literal: true

require 'test_helper'

describe Observability::OpenTelemetry do
  before do
    CDO.stubs(:enable_opentelemetry).returns(false)
    CDO.stubs(:running_web_application?).returns(false)
  end

  describe '.setup' do
    describe 'when CDO.enable_opentelemetry is false' do
      before {CDO.stubs(:running_web_application?).returns(true)}

      it 'returns without configuring the SDK' do
        _(Observability::OpenTelemetry.setup).must_be_nil
      end
    end

    describe 'when CDO.running_web_application? is false' do
      before {CDO.stubs(:enable_opentelemetry).returns(true)}

      it 'returns without configuring the SDK' do
        _(Observability::OpenTelemetry.setup).must_be_nil
      end
    end

    describe 'when both CDO.enable_opentelemetry and running_web_application? are true' do
      before do
        CDO.stubs(:enable_opentelemetry).returns(true)
        CDO.stubs(:running_web_application?).returns(true)
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

        it 'sets OTEL_LOG_LEVEL to fatal outside of development' do
          ENV.delete('OTEL_LOG_LEVEL')
          Rails.env.stubs(:development?).returns(false)
          Observability::OpenTelemetry.setup
          _(ENV.fetch('OTEL_LOG_LEVEL', nil)).must_equal 'fatal'
        end

        it 'does not set OTEL_LOG_LEVEL in development' do
          ENV.delete('OTEL_LOG_LEVEL')
          Rails.env.stubs(:development?).returns(true)
          Observability::OpenTelemetry.setup
          _(ENV.fetch('OTEL_LOG_LEVEL', nil)).must_be_nil
        end

        it 'does not override an existing OTEL_LOG_LEVEL' do
          ENV['OTEL_LOG_LEVEL'] = 'debug'
          Rails.env.stubs(:development?).returns(false)
          Observability::OpenTelemetry.setup
          _(ENV.fetch('OTEL_LOG_LEVEL', nil)).must_equal 'debug'
        end
      end
    end
  end
end
