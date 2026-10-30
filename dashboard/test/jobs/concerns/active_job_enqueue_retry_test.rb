require 'test_helper'

class ActiveJobEnqueueRetryTest < ActiveJob::TestCase
  class TestJob < ApplicationJob
    def perform
    end
  end

  class RecordingQueueAdapter
    attr_reader :enqueue_attempts

    def initialize(failures = [])
      @failures = failures
      @enqueue_attempts = 0
    end

    def enqueue(job)
      @enqueue_attempts += 1
      raise @failures.shift unless @failures.empty?

      job.provider_job_id = @enqueue_attempts
    end

    def enqueue_at(job, _timestamp)
      enqueue(job)
    end
  end

  def with_queue_adapter(job_class, queue_adapter)
    test_queue_adapter = job_class._test_adapter
    job_class.disable_test_adapter
    original_queue_adapter = job_class.queue_adapter
    job_class.queue_adapter = queue_adapter
    yield
  ensure
    job_class.queue_adapter = original_queue_adapter
    job_class.enable_test_adapter(test_queue_adapter) if test_queue_adapter
  end

  describe '.perform_later' do
    subject(:perform_later) {TestJob.perform_later}

    before do
      Kernel.stubs(:sleep)
    end

    ActiveJobEnqueueRetry::RETRYABLE_ENQUEUE_ERRORS.each do |error_class|
      it "retries #{error_class.name} twice" do
        recording_queue_adapter = RecordingQueueAdapter.new(
          [
            error_class.new('first enqueue error'),
            error_class.new('second enqueue error'),
          ]
        )

        result = with_queue_adapter(TestJob, recording_queue_adapter) {perform_later}

        _(result).must_be_instance_of TestJob
        _(result).must_be :successfully_enqueued?
        _(result.enqueue_error).must_be_nil
        _(recording_queue_adapter.enqueue_attempts).must_equal 3
      end
    end

    it 'raises the final database error after all retries fail' do
      enqueue_failures = [
        ActiveRecord::AdapterTimeout.new('first timeout'),
        ActiveRecord::AdapterTimeout.new('second timeout'),
        ActiveRecord::AdapterTimeout.new('final timeout'),
      ]
      recording_queue_adapter = RecordingQueueAdapter.new(enqueue_failures.dup)

      enqueue_job = -> {with_queue_adapter(TestJob, recording_queue_adapter) {perform_later}}
      error = _(enqueue_job).must_raise ActiveRecord::AdapterTimeout

      _(error).must_be_same_as enqueue_failures.last
      _(recording_queue_adapter.enqueue_attempts).must_equal 3
    end

    it 'does not retry ActiveJob enqueue errors caused by transient database errors' do
      enqueue_error = ActiveJob::EnqueueError.new('deadlock')
      recording_queue_adapter = RecordingQueueAdapter.new([enqueue_error])

      result = with_queue_adapter(TestJob, recording_queue_adapter) {perform_later}

      _(result).must_equal false
      _(recording_queue_adapter.enqueue_attempts).must_equal 1
    end

    it 'does not retry non-retryable ActiveJob enqueue error' do
      enqueue_error = ActiveJob::EnqueueError.new('enqueue error')
      recording_queue_adapter = RecordingQueueAdapter.new([enqueue_error])

      result = with_queue_adapter(TestJob, recording_queue_adapter) {perform_later}

      _(result).must_equal false
      _(recording_queue_adapter.enqueue_attempts).must_equal 1
    end

    it 'does not retry non-database exception' do
      enqueue_error = RuntimeError.new('enqueue error')
      recording_queue_adapter = RecordingQueueAdapter.new([enqueue_error])

      enqueue_job = -> {with_queue_adapter(TestJob, recording_queue_adapter) {perform_later}}
      error = _(enqueue_job).must_raise RuntimeError

      _(error).must_be_same_as enqueue_error
      _(recording_queue_adapter.enqueue_attempts).must_equal 1
    end
  end
end
