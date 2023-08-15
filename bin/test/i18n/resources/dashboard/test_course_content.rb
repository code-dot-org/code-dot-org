require_relative '../../../test_helper'
require_relative '../../../../i18n/resources/dashboard/course_content'

class I18n::Resources::Dashboard::CourseContentTest < Minitest::Test
  def test_sync_in
    I18n::Resources::Dashboard::CourseContent::SyncIn.expects(:perform).once

    I18n::Resources::Dashboard::CourseContent.sync_in
  end
end
