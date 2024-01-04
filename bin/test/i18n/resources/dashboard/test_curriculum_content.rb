require_relative '../../../test_helper'
require_relative '../../../../i18n/resources/dashboard/curriculum_content'

describe I18n::Resources::Dashboard::CurriculumContent do
  describe '.sync_in' do
    it 'sync-in CurriculumContent resource' do
      I18n::Resources::Dashboard::CurriculumContent::SyncIn.expects(:perform).once
      I18n::Resources::Dashboard::CurriculumContent.sync_in
    end
  end

  describe '.sync_out' do
    it 'sync-out CurriculumContent resource' do
      I18n::Resources::Dashboard::CurriculumContent::SyncOut.expects(:perform).once
      I18n::Resources::Dashboard::CurriculumContent.sync_out
    end
  end
end
