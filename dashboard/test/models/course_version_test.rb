require 'test_helper'

class CourseVersionTest < ActiveSupport::TestCase
  test "course version associations" do
    course_version = create :course_version
    assert_instance_of UnitGroup, course_version.content_root
    assert_equal course_version, course_version.content_root.course_version

    course_version = create :course_version, :with_unit
    assert_instance_of Script, course_version.content_root
    assert_equal course_version, course_version.content_root.course_version
  end

  test "recommended? is false if course_version is not stable" do
    offering1 = create :course_offering
    script = create :script, family_name: 'ss', version_year: '2050', is_course: true, published_state: SharedCourseConstants::PUBLISHED_STATE.beta
    course_version1 = CourseVersion.add_course_version(offering1, script)

    offering2 = create :course_offering
    unit_group = create :unit_group, family_name: 'ug', version_year: '2050', published_state: SharedCourseConstants::PUBLISHED_STATE.beta
    course_version2 = CourseVersion.add_course_version(offering2, unit_group)

    refute course_version1.recommended?
    refute course_version2.recommended?
  end

  test "recommended? is true if its the only course version in the course offering" do
    offering1 = create :course_offering
    script = create :script, family_name: 'ss', version_year: '2050', is_course: true, published_state: SharedCourseConstants::PUBLISHED_STATE.stable
    course_version1 = CourseVersion.add_course_version(offering1, script)

    offering2 = create :course_offering
    unit_group = create :unit_group, family_name: 'ug', version_year: '2050', published_state: SharedCourseConstants::PUBLISHED_STATE.stable
    course_version2 = CourseVersion.add_course_version(offering2, unit_group)

    assert course_version1.recommended?
    assert course_version2.recommended?
  end

  test "recommended? is true if its the latest stable version in the family" do
    offering1 = create :course_offering
    script = create :script, family_name: 'ss', version_year: '2050', is_course: true, supported_locales: ['fake-locale'], published_state: SharedCourseConstants::PUBLISHED_STATE.stable
    course_version_1_1 = CourseVersion.add_course_version(offering1, script)
    script2 = create :script, family_name: 'ss', version_year: '2051', is_course: true, supported_locales: [], published_state: SharedCourseConstants::PUBLISHED_STATE.stable
    course_version_1_2 = CourseVersion.add_course_version(offering1, script2)

    offering2 = create :course_offering
    unit_group = create :unit_group, family_name: 'ug', version_year: '2050', published_state: SharedCourseConstants::PUBLISHED_STATE.stable
    course_version_2_1 = CourseVersion.add_course_version(offering2, unit_group)
    unit_group2 = create :unit_group, family_name: 'ug', version_year: '2051', published_state: SharedCourseConstants::PUBLISHED_STATE.stable
    course_version_2_2 = CourseVersion.add_course_version(offering2, unit_group2)

    refute course_version_1_1.recommended?('en-us')
    assert course_version_1_2.recommended?('en-us')
    assert_equal course_version_1_2.content_root, Script.latest_stable_version('ss')
    assert course_version_1_1.recommended?('fake-locale')
    refute course_version_1_2.recommended?('fake-locale')
    assert_equal course_version_1_1.content_root, Script.latest_stable_version('ss', locale: 'fake-locale')
    refute course_version_2_1.recommended?
    assert course_version_2_2.recommended?
    assert_equal course_version_2_2.content_root, UnitGroup.latest_stable_version('ss')
  end

  test "add_course_version creates CourseVersion for script that doesn't have one if is_course is true" do
    offering = create :course_offering
    script = create :script, family_name: 'csz', version_year: '2050', is_course: true
    course_version = CourseVersion.add_course_version(offering, script)

    assert_equal course_version, CourseVersion.find_by(course_offering: offering, key: '2050')
  end

  test "add_course_version updates existing CourseVersion for script if properties change" do
    course_version = create :course_version, :with_unit
    script = course_version.content_root
    offering = course_version.course_offering

    script.version_year = '2060'
    script.save
    CourseVersion.add_course_version(offering, script)

    assert_equal '2060', script.course_version.key
    assert_equal '2060', script.course_version.display_name
    assert_equal script.course_version, CourseVersion.find_by(course_offering: course_version.course_offering, key: '2060')
    assert_nil CourseVersion.find_by(course_offering: offering, key: '2050') # old CourseVersion should be deleted
  end

  test "add_course_version deletes CourseVersion for script if is_course is changed to false" do
    course_version = create :course_version, :with_unit
    script = course_version.content_root
    offering = course_version.course_offering

    script.is_course = false
    script.save
    course_version = CourseVersion.add_course_version(offering, script)

    assert_nil course_version
    assert_nil script.course_version
    assert_nil CourseVersion.find_by(course_offering: offering, key: '2050')
  end

  test "add_course_version does nothing for script without CourseVersion if is_course is false" do
    offering = create :course_offering
    script = create :script, family_name: 'csz', version_year: '2050'
    course_version = CourseVersion.add_course_version(offering, script)

    assert_nil course_version
    assert_nil script.course_version
    assert_nil CourseVersion.find_by(course_offering: offering, key: '2050')
  end

  test "destroy_and_destroy_parent_if_empty destroys version and offering for offering with one version" do
    course_version = create :course_version
    offering = course_version.course_offering

    course_version.destroy_and_destroy_parent_if_empty
    assert_nil CourseVersion.find_by(course_offering: offering, key: course_version.key)
    assert_nil CourseOffering.find_by(id: offering.id)
  end

  test "destroy_and_destroy_parent_if_empty destroys version only for offering with multiple versions" do
    course_version = create :course_version
    offering = course_version.course_offering
    create :course_version, course_offering: offering

    course_version.destroy_and_destroy_parent_if_empty
    assert_nil CourseVersion.find_by(course_offering: offering, key: course_version.key)
    assert_equal offering, CourseOffering.find_by(id: offering.id)
  end

  test "destroy_and_destroy_parent_if_empty destroys version for version with no offering" do
    # This case shouldn't occur normally, but may exist temporarily because the CourseOffering model was added after CourseVersion.
    course_version = create :course_version, course_offering: nil
    assert_nil course_version.course_offering

    course_version.destroy_and_destroy_parent_if_empty
    assert_nil CourseVersion.find_by(course_offering: nil, key: course_version.key)
  end

  test "enforces key format" do
    course_version = build :course_version, key: 'invalid key'
    refute course_version.valid?
    course_version.key = '0123456789abcdefghijklmnopqrstuvwxyz-'
    assert course_version.valid?
  end

  test "throws exception if changing course version of content root that prevent course version change" do
    script = create :script, is_course: true
    script.stubs(:prevent_course_version_change?).returns(true)
    course_offering = create :course_offering
    assert_raises do
      CourseVersion.add_course_version(course_offering, script)
    end
  end
end
