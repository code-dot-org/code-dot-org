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

  # One "integration test" of seeding from DSL creating a CourseVersion for a Script with is_course true.
  # Other cases are covered by directly testing add_course_version below.
  test "Script.setup creates CourseVersion if is_course is true" do
    script_file = File.join(self.class.fixture_path, 'test-script-course-version.script')
    scripts, _ = Script.setup([script_file])
    script = scripts.first

    course_version = CourseVersion.find_by(key: 'xyz-1234')
    assert_equal course_version, script.course_version
    assert_equal 'xyz-1234', course_version.key
    assert_equal '1234', course_version.display_name
  end

  test "add_course_version creates CourseVersion for script that doesn't have one if is_course is true" do
    script = create :script, family_name: 'csz', version_year: '2050', is_course: true
    course_version = CourseVersion.add_course_version(script)

    assert_equal course_version, CourseVersion.find_by(key: 'csz-2050')
  end

  test "add_course_version updates existing CourseVersion for script if properties change" do
    script = create :script, family_name: 'csz', version_year: '2050', is_course: true
    CourseVersion.add_course_version(script)

    assert_equal 'csz-2050', script.course_version.key
    assert_equal '2050', script.course_version.display_name

    script.family_name = 'csx'
    script.version_year = '2060'
    script.save

    CourseVersion.add_course_version(script)

    assert_equal 'csx-2060', script.course_version.key
    assert_equal '2060', script.course_version.display_name
    assert_equal script.course_version, CourseVersion.find_by(key: 'csx-2060')
    assert_nil CourseVersion.find_by(key: 'csz-2050') # old CourseVersion should be deleted
  end

  test "add_course_version deletes CourseVersion for script if is_course is changed to false" do
    script = create :script, family_name: 'csz', version_year: '2050', is_course: true
    CourseVersion.add_course_version(script)

    assert_not_nil script.course_version

    script.is_course = false
    script.save
    course_version = CourseVersion.add_course_version(script)

    assert_nil course_version
    assert_nil script.course_version
    assert_nil CourseVersion.find_by(key: 'csz-2050')
  end

  test "add_course_version does nothing for script without CourseVersion if is_course is false" do
    script = create :script, family_name: 'csz', version_year: '2050'
    course_version = CourseVersion.add_course_version(script)

    assert_nil course_version
    assert_nil script.course_version
    assert_nil CourseVersion.find_by(key: 'csz-2050')
  end
end
