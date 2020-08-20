require 'test_helper'

class CourseOfferingTest < ActiveSupport::TestCase
  test "course offering associations" do
    course_offering = create :course_offering
    version1 = create :course_version, course_offering: course_offering
    version2 = create :course_version, course_offering: course_offering

    assert_equal [version1, version2], course_offering.course_versions
    assert_equal course_offering, version1.course_offering
    assert_equal course_offering, version2.course_offering
  end
end
