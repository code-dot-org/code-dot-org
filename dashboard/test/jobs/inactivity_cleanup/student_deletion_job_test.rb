require 'test_helper'

class InactivityCleanup::StudentDeletionJobTest < ActiveJob::TestCase
  let(:described_class) {InactivityCleanup::StudentDeletionJob}
  let(:described_instance) {described_class.new}

  it 'inherits from ApplicationJob' do
    _(described_class.superclass).must_equal ::ApplicationJob
  end

  describe '#perform' do
    subject(:perform_job) {described_instance.perform(**described_instance_args)}

    let(:described_instance_args) {{}}

    before do
      InactivityCleanup::StudentDeleter.any_instance.stubs(:call)
    end

    it 'calls inactive student deleter with default arguments' do
      InactivityCleanup::StudentDeleter.
        expects(:new).
        with(dry_run: false, limit: nil).
        returns(mock('inactive student deleter', call: nil)).
        once

      perform_job
    end

    context 'when :dry_run is provided' do
      let(:dry_run) {'expected_dry_run_arg'}
      let(:described_instance_args) {{dry_run:}}

      it 'calls inactive student deleter with provided :dry_run argument' do
        InactivityCleanup::StudentDeleter.
          expects(:new).
          with(dry_run:, limit: nil).
          returns(mock('inactive student deleter', call: nil)).
          once

        perform_job
      end
    end

    context 'when :limit is provided' do
      let(:limit) {'expected_limit_arg'}
      let(:described_instance_args) {{limit:}}

      it 'calls inactive student deleter with provided :dry_run argument' do
        InactivityCleanup::StudentDeleter.
          expects(:new).
          with(dry_run: false, limit:).
          returns(mock('inactive student deleter', call: nil)).
          once

        perform_job
      end
    end

    context 'when something went wrong' do
      let(:exception) {StandardError.new('expected_exception')}

      before do
        described_instance.stubs(:perform).raises(exception)
      end

      it 'reports exception' do
        described_instance.expects(:report_exception).with(exception).once
        described_instance.perform_now
      end
    end
  end
end
