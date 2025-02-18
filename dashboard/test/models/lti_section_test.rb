require "test_helper"

class LtiSectionTest < ActiveSupport::TestCase
  test "should validate required fields" do
    refute build(:lti_section, lti_course: nil).valid? "lti_course is required"
    refute build(:lti_section, section: nil).valid? "section is required"
  end

  test "single course can have multiple sections" do
    course = create(:lti_course)
    create(:lti_section, lti_course: course)
    assert build(:lti_section, lti_course: course).valid? "course can have multiple sections"
  end

  test "sections should only have one lti_section" do
    section = create(:section)
    create(:lti_section, section: section)
    assert build(:lti_section, section: section).invalid? "section should only have one lti_section"
  end

  test "when an lti_section is deleted, the associated regular section is also deleted" do
    section = create(:section)
    lti_section = create(:lti_section, section: section)
    lti_section.destroy
    assert section.reload.deleted_at.present?, "section should be deleted"
    assert Section.find_by(id: section.id).nil?, "section should be deleted"
  end
end
