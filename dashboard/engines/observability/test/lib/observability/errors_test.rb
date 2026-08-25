# frozen_string_literal: true

require 'test_helper'

# The honeybadger gem is not a dependency of this engine and report only ever
# calls .notify, so a stub constant is enough to exercise the delegation.
module Honeybadger
  def self.notify(_exception_or_opts, _opts = {})
  end
end

describe Observability::Errors do
  let(:exception) {RuntimeError.new('test error')}

  before do
    Observability::Sentry.stubs(:enabled?).returns(false)
    Honeybadger.stubs(:notify)
  end

  describe 'Honeybadger delegation' do
    it 'passes a lone exception through with no options' do
      Honeybadger.expects(:notify).with(exception)

      Observability::Errors.report(exception)
    end

    it 'passes context through verbatim' do
      context = {user_id: 7, level_id: 3}
      Honeybadger.expects(:notify).with(exception, context: context)

      Observability::Errors.report(exception, context: context)
    end

    it 'passes notice options through verbatim' do
      Honeybadger.expects(:notify).with(exception, error_message: 'Error loading JSON', context: {path: '/tmp/x'})

      Observability::Errors.report(exception, error_message: 'Error loading JSON', context: {path: '/tmp/x'})
    end

    it 'passes a message string through verbatim' do
      Honeybadger.expects(:notify).with('API key is missing', context: {endpoint: 'https://example.com'})

      Observability::Errors.report('API key is missing', context: {endpoint: 'https://example.com'})
    end

    it 'sends a bare options hash when there is no exception or message' do
      # Honeybadger reads this shape positionally, not as keywords.
      Honeybadger.expects(:notify).with({error_class: 'DeprecatedEndpointWarning', error_message: 'called'})

      Observability::Errors.report(error_class: 'DeprecatedEndpointWarning', error_message: 'called')
    end

    describe 'when Honeybadger is not loaded' do
      it 'skips the Honeybadger call instead of raising' do
        hidden = Object.send(:remove_const, :Honeybadger)

        begin
          _(Observability::Errors.report(exception)).must_be_nil
        ensure
          Object.const_set(:Honeybadger, hidden)
        end
      end
    end
  end

  describe 'Sentry delegation' do
    it 'does not call Sentry when Sentry is disabled' do
      Sentry.expects(:capture_exception).never
      Sentry.expects(:capture_message).never

      _(Observability::Errors.report(exception)).must_be_nil
    end

    describe 'when Sentry is enabled but the gem is not loaded' do
      it 'attempts the standalone setup' do
        Observability::Sentry.stubs(:enabled?).returns(true)
        Observability::Sentry.expects(:setup_standalone)
        hidden = Object.send(:remove_const, :Sentry)

        begin
          _(Observability::Errors.report(exception)).must_be_nil
        ensure
          Object.const_set(:Sentry, hidden)
        end
      end
    end

    describe 'when Sentry is enabled' do
      before {Observability::Sentry.stubs(:enabled?).returns(true)}

      it 'captures an exception with the context as extras' do
        Sentry.expects(:capture_exception).with(exception, extra: {user_id: 7})

        Observability::Errors.report(exception, context: {user_id: 7})
      end

      it 'captures a message string' do
        Sentry.expects(:capture_message).with('API key is missing', extra: {endpoint: 'https://example.com'})

        Observability::Errors.report('API key is missing', context: {endpoint: 'https://example.com'})
      end

      it 'folds the Honeybadger notice options into the extras' do
        Sentry.expects(:capture_exception).with(
          exception,
          extra: {zip_code: '02101', error_message: 'Error geocoding'},
        )

        Observability::Errors.report(exception, error_message: 'Error geocoding', context: {zip_code: '02101'})
      end

      it 'captures error_message as the message when there is no exception' do
        Sentry.expects(:capture_message).with(
          'unused interpolation',
          extra: {error_class: 'Interpolation', error_message: 'unused interpolation'},
        )

        Observability::Errors.report(error_class: 'Interpolation', error_message: 'unused interpolation')
      end

      it 'returns the Sentry event so callers can read its event_id' do
        event = stub('sentry_event')
        Sentry.stubs(:capture_exception).returns(event)

        _(Observability::Errors.report(exception)).must_equal event
      end
    end
  end
end
