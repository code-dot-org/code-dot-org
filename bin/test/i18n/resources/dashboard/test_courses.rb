require_relative '../../../test_helper'
require_relative '../../../../i18n/resources/dashboard/courses'

describe I18n::Resources::Dashboard::Courses do
  describe '.sync_in' do
    it 'sync-in Courses resource' do
      I18n::Resources::Dashboard::Courses::SyncIn.expects(:perform).once
      I18n::Resources::Dashboard::Courses.sync_in
    end
  end

  describe '.sync_out' do
    it 'sync-out Courses resource' do
      I18n::Resources::Dashboard::Courses::SyncOut.expects(:perform).once
      I18n::Resources::Dashboard::Courses.sync_out
    end
  end
end
