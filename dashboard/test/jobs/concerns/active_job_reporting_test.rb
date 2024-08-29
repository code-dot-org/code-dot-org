# frozen_string_literal: true

require 'test_helper'

class ActiveJobReportingTest < ActiveJob::TestCase
  class TestableJob < ::ActiveJob::Base
    include ActiveJobReporting

    rescue_from StandardError, with: :report_exception

    def perform(...)
    end
  end

  subject(:described_class) {ActiveJobReportingTest::TestableJob}
  subject(:decribed_instance) {described_class.new(*job_args)}

  let(:job_args) {[]}

  before do
    Honeybadger.stubs(:notify)
  end

  describe '#report_exception' do
    subject(:report_exception) {decribed_instance.send(:report_exception, exception)}

    let(:exception) {StandardError.new('expected_error')}

    let(:job_arg1) {'expected_arg1'}
    let(:job_arg2) {{'expected_arg2' => 'key_arg'}}
    let(:job_args) {[job_arg1, job_arg2]}

    it 'reports exception to Honeybadger' do
      Honeybadger.expects(:notify).with(
        exception,
        has_entries(
          error_message: '[ActiveJobReportingTest::TestableJob] Runtime error',
          context: has_entries(
            job: has_entries(
              'arguments' => job_args,
              'exception_executions' => anything,
              'executions' => anything,
              'job_id' => anything,
              'priority' => anything,
              'queue_name' => anything,
              'timezone' => anything
            )
          )
        )
      ).once

      _ {report_exception}.must_raise
    end

    it 're-raises exception' do
      actual_exception = _ {report_exception}.must_raise exception.class
      _(actual_exception).must_equal exception
    end
  end

  describe '.perform_later' do
    subject(:perform_later) {described_class.perform_later(*job_args)}

    context 'when StandardError' do
      let(:exception) {StandardError.new('expected_error')}

      before do
        described_class.any_instance.stubs(:perform).raises(exception)
      end

      it 'rescues from exception with #report_exception' do
        perform_enqueued_jobs do
          described_class.any_instance.expects(:report_exception).with(exception).once

          perform_later

          assert_performed_jobs 1
        end
      end
    end
  end
end
