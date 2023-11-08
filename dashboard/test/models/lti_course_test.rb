require "test_helper"

class LtiCourseTest < ActiveSupport::TestCase
  test "should validate required fields" do
    refute build(:lti_course, lti_integration: nil).valid? "lti_integration is required"
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
end
