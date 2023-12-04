require_relative '../../../test_helper'
require_relative '../../../../i18n/resources/dashboard/course_offerings'

describe I18n::Resources::Dashboard::CourseOfferings do
  describe '.sync_in' do
    it 'sync-in Labs (blockly-mooc) resource' do
      I18n::Resources::Dashboard::CourseOfferings::SyncIn.expects(:perform).once

      I18n::Resources::Dashboard::CourseOfferings.sync_in
    end
  end

  describe '.sync_out' do
    it 'sync-out Labs (blockly-mooc) resource' do
      I18n::Resources::Dashboard::CourseOfferings::SyncOut.expects(:perform).once

      I18n::Resources::Dashboard::CourseOfferings.sync_out
    end
  end
end
