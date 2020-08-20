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

  test "add_course_offering creates CourseOffering and CourseVersion for new script if is_course is true" do
    family_name = 'csz'
    version_year = '2050'
    script = create :script, family_name: family_name, version_year: version_year, is_course: true
    offering = CourseOffering.add_course_offering(script)

    assert_equal offering.key, family_name
    assert_equal offering.display_name, family_name
    assert_equal offering, CourseOffering.find_by(key: family_name)
    assert_equal offering.course_versions, [CourseVersion.find_by(course_offering: offering, key: version_year)]
  end
end
