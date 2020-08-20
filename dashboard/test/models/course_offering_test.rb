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

  test "add_course_offering updates existing CourseOffering and CourseVersion for script if properties change" do
    family_name = 'csz'
    version_year = '2050'
    script = create :script, family_name: 'csz', version_year: '2050', is_course: true
    original_course_offering = CourseOffering.add_course_offering(script)

    assert_equal version_year, script.course_version.key
    assert_equal version_year, script.course_version.display_name
    assert_equal family_name, script.course_version.course_offering.key
    assert_equal family_name, script.course_version.course_offering.display_name

    family_name_new = 'csx'
    version_year_new = '2060'
    script.family_name = family_name_new
    script.version_year = version_year_new
    script.save

    CourseOffering.add_course_offering(script)

    assert_equal version_year_new, script.course_version.key
    assert_equal version_year_new, script.course_version.display_name
    assert_equal family_name_new, script.course_version.course_offering.key
    assert_equal family_name_new, script.course_version.course_offering.display_name

    assert_nil CourseVersion.find_by(course_offering: original_course_offering, key: version_year) # old CourseVersion should be deleted
    assert_nil CourseOffering.find_by(key: family_name) # old CourseOffering should be deleted
  end
end
