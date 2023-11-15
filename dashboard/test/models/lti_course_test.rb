require "test_helper"

class LtiCourseTest < ActiveSupport::TestCase
  test "should validate required fields" do
    refute build(:lti_course, lti_integration: nil, lti_deployment: create(:lti_deployment)).valid? "lti_integration is required"
    refute build(:lti_course, lti_deployment: nil).valid? "lti_deployment is required"
  end

  test "should validate uniqueness of context_id" do
    course = create(:lti_course)
    refute build(:lti_course, context_id: course.context_id, lti_integration: course.lti_integration).valid? "context_id must be unique for a given lti_integration"
  end

  test "validates that nrps_url is a valid URL" do
    refute build(:lti_course, nrps_url: "not a url").valid? "nrps_url must be a valid URL"
    assert build(:lti_course, nrps_url: "https://www.example.com/names_and_roles").valid? "nrps_url must be a valid URL"
  end

  test "can have multiple sections via LTI sections" do
    course = create(:lti_course)
    create(:lti_section, lti_course: course)
    create(:lti_section, lti_course: course)
    assert course.sections.count == 2, "course should have a section per LTI section"
  end

  test "when a course is deleted, the associated sections and LTI sections are also deleted" do
    course = create(:lti_course)
    sections = create_list(:section, 2)
    lti_sections = sections.map {|section| create(:lti_section, lti_course: course, section: section)}
    LtiCourse.destroy(course.id)
    assert LtiCourse.find_by(id: course.id).nil?, "course should be deleted"
    sections.each do |section|
      assert section.reload.deleted_at.present?, "section should be deleted"
    end
    lti_sections.each do |lti_section|
      assert lti_section.reload.deleted_at.present?, "lti_section should be deleted"
    end
  end
end
