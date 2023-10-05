require_relative '../../../test_helper'
require_relative '../../../../i18n/resources/dashboard/curriculum_content'

describe I18n::Resources::Dashboard::CourseContent do
  describe '.sync_in' do
    it 'sync-in CourseContent resource' do
      I18n::Resources::Dashboard::CourseContent::SyncIn.expects(:perform).once
      I18n::Resources::Dashboard::CourseContent.sync_in
    end
  end

  describe '.sync_out' do
    it 'sync-out CourseContent resource' do
      I18n::Resources::Dashboard::CourseContent::SyncOut.expects(:perform).once
      I18n::Resources::Dashboard::CourseContent.sync_out
    end
  end
end
