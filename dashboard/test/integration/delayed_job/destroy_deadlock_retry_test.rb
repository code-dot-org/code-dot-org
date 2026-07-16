require 'test_helper'

class DelayedJobDestroyDeadlockRetryTest < ActionDispatch::IntegrationTest
  include Minitest::RSpecMocks

  self.use_transactional_tests = false
  self.pre_loaded_fixtures = false

  class TestJob < ::ApplicationJob
    self.queue_adapter = :delayed_job

    class_attribute :perform_count, default: 0

    def self.reset
      self.perform_count = 0
    end

    def perform
      self.class.perform_count += 1
    end
  end

  let(:active_job) {TestJob.perform_later}
  let(:delayed_job) {Delayed::Job.find(active_job.provider_job_id)}

  let(:deletion_deadlock_count) {1}
  let(:deletion_deadlock_error) {ActiveRecord::Deadlocked.new('deletion deadlock test')}

  around do |test|
    TestJob.disable_test_adapter
    test.call
  ensure
    TestJob.reset
    delayed_job.destroy!
  end

  before do
    @destroy_row_attempts = 0
    allow_any_instance_of(Delayed::Backend::ActiveRecord::Job).to receive(:destroy_row).and_wrap_original do |original|
      @destroy_row_attempts += 1
      raise deletion_deadlock_error if @destroy_row_attempts <= deletion_deadlock_count
      original.call
    end
  end

  it 'retries deletion after deadlock' do
    Observability::Errors.expects(:capture_exception).with(deletion_deadlock_error).never

    _ {Delayed::Worker.new.run(delayed_job)}.must_change -> {TestJob.perform_count}, from: 0, to: 1

    _(Delayed::Job).wont_be :exists?, delayed_job.id
  end

  context 'when retry also deadlocks' do
    let(:deletion_deadlock_count) {2}

    it 'captures exception' do
      Observability::Errors.expects(:capture_exception).with(deletion_deadlock_error).once

      _ {Delayed::Worker.new.run(delayed_job)}.must_change -> {TestJob.perform_count}, from: 0, to: 1

      _(Delayed::Job).must_be :exists?, delayed_job.id
    end
  end
end
