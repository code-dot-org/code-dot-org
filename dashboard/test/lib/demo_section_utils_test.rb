require 'test_helper'
require 'demo_section_utils'

class DemoSectionUtilsTest < ActiveSupport::TestCase
  test 'creates a demo section for a new teacher' do
    teacher = create(:teacher)
    sections = Section.where(user_id: teacher.id, name: DemoSectionUtils::DEMO_SECTION_NAME)
    assert_equal 1, sections.count
    section = sections.first
    assert_equal Section::LOGIN_TYPE_PICTURE, section.login_type
    assert_equal 0, section.students.count
  end

  test 'does not create a demo section for a student' do
    student = create(:student)
    sections = Section.where(user_id: student.id, name: DemoSectionUtils::DEMO_SECTION_NAME)
    assert_equal 0, sections.count
  end
end
