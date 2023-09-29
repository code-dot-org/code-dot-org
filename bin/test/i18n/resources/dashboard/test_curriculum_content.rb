require_relative '../../../test_helper'
require_relative '../../../../i18n/resources/dashboard/curriculum_content'

class I18n::Resources::Dashboard::CurriculumContentTest < Minitest::Test
  def test_sync_in
    I18n::Resources::Dashboard::CurriculumContent::SyncIn.expects(:perform).once

    I18n::Resources::Dashboard::CurriculumContent.sync_in
  end
end
