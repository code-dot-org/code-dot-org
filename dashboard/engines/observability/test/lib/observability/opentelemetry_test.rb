# frozen_string_literal: true

require 'test_helper'

describe Observability::OpenTelemetry do
  before do
    CDO.enable_opentelemetry = false
    CDO.running_web_application = false
  end

  describe '.setup' do
    describe 'when CDO.enable_opentelemetry is false' do
      before {CDO.running_web_application = true}

      it 'returns without configuring the SDK' do
        _(Observability::OpenTelemetry.setup).must_be_nil
      end
    end

    describe 'when CDO.running_web_application? is false' do
      before {CDO.enable_opentelemetry = true}

      it 'returns without configuring the SDK' do
        _(Observability::OpenTelemetry.setup).must_be_nil
      end
    end

    describe 'when both CDO.enable_opentelemetry and running_web_application? are true' do
      before do
        CDO.enable_opentelemetry = true
        CDO.running_web_application = true
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
    end
  end
end
