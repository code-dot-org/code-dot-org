# frozen_string_literal: true

require 'test_helper'

class HocLegacy::RefreshTutorialsJobTest < ActiveJob::TestCase
  describe '.superclass' do
    subject(:super_class) {described_class.superclass}

    it 'inherits from ApplicationJob' do
      _super_class.must_equal ::ApplicationJob
    end
  end

  describe '.perform_later' do
    subject(:perform_later) {described_class.perform_later}

    before do
      HocLegacy::Tutorials.stubs(:refresh)
    end

    it 'enqueues job to "default" queue' do
      assert_enqueued_with(job: described_class, queue: 'default') do
        perform_later
      end
    end

    it 'refreshes Tutorials' do
      perform_enqueued_jobs do
        HocLegacy::Tutorials.expects(:refresh).once
        perform_later
        assert_performed_jobs 1
      end
    end

    context 'when StandardError is raised' do
      let(:exception) {StandardError.new('expected_exception')}

      before do
        HocLegacy::Tutorials.stubs(:refresh).raises(exception)
      end

      it 'rescues from exception with #report_exception' do
        perform_enqueued_jobs do
          described_class.any_instance.expects(:report_exception).with(exception).once
          perform_later
          assert_performed_jobs 1
        end
      end
    end

    context 'when tracking is disabled' do
      before do
        CDO.stubs(:hoc_tracking_enabled).returns(false)
      end

      it 'doe not refresh Tutorials' do
        perform_enqueued_jobs do
          HocLegacy::Tutorials.expects(:refresh).never
          perform_later
          assert_performed_jobs 1
        end
      end
    end
  end
end
