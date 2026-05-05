# frozen_string_literal: true

require 'test_helper'

describe Observability::Errors do
  before do
    CDO.stubs(:enable_sentry).returns(false)
    CDO.stubs(:unit_test).returns(false)
  end

  describe '.capture_exception' do
    let(:exception) {RuntimeError.new('test error')}

    it 'returns without calling Sentry when Sentry is disabled' do
      Sentry.expects(:capture_exception).never

      _(Observability::Errors.capture_exception(exception)).must_be_nil
    end

    it 'delegates to Sentry when Sentry is enabled' do
      CDO.stubs(:enable_sentry).returns(true)

      Sentry.expects(:capture_exception).with(exception, tags: {source: 'test'})
      Observability::Errors.capture_exception(exception, tags: {source: 'test'})
    end
  end

  describe '.capture_message' do
    let(:error_message) {'test error'}

    it 'returns without calling Sentry when Sentry is disabled' do
      Sentry.expects(:capture_message).never

      _(Observability::Errors.capture_message(error_message)).must_be_nil
    end

    it 'delegates to Sentry when Sentry is enabled' do
      CDO.stubs(:enable_sentry).returns(true)

      Sentry.expects(:capture_message).with(error_message, level: :warning)
      Observability::Errors.capture_message(error_message, level: :warning)
    end
  end
end
