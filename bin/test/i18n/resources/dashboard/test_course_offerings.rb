require_relative '../../../test_helper'
require_relative '../../../../i18n/resources/dashboard/course_offerings'

describe I18n::Resources::Dashboard::CourseOfferings do
  let(:described_class) {I18n::Resources::Dashboard::CourseOfferings}

  describe '.sync_in' do
    it 'sync-in CourseOfferings resource' do
      described_class::SyncIn.expects(:perform).once
      described_class.sync_in
    end
  end

  describe '.sync_up' do
    it 'sync-up CourseOfferings resource' do
      described_class::SyncUp.expects(:perform).once
      described_class.sync_up
    end
  end

  describe '.sync_out' do
    it 'sync-out CourseOfferings resource' do
      described_class::SyncOut.expects(:perform).once
      described_class.sync_out
    end
  end
end
