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

  # "Integration tests" of on seeding from .script and .course files.
  # Other cases are covered by directly testing add_course_offering below.
  test "Script.setup creates CourseOffering and CourseVersion if is_course is true" do
    script_file = File.join(self.class.fixture_path, 'test-script-course-version.script')
    script_names, _ = Script.setup([script_file])
    script = Script.find_by!(name: script_names.first)

    offering = script.course_version.course_offering
    assert_equal 'xyz', offering.key
    assert_equal CourseVersion.where(key: '1234'), offering.course_versions
  end

  test "ScriptSeed.seed_from_json_file creates CourseOffering and CourseVersion if is_course is true" do
    script_file = File.join(self.class.fixture_path, 'test-new-seed-course-offering.script_json')
    script = Services::ScriptSeed.seed_from_json_file(script_file)

    offering = script.course_version.course_offering
    assert_equal 'xyz', offering.key
    assert_equal CourseVersion.where(key: '1234'), offering.course_versions
  end

  test "UnitGroup.load_from_path creates CourseOffering and CourseVersion if is_course is true" do
    course_file = File.join(self.class.fixture_path, 'test-course-offering.course')
    unit_group = UnitGroup.load_from_path(course_file)

    offering = unit_group.course_version.course_offering
    assert_equal 'xyz', offering.key
    assert_equal CourseVersion.where(key: '1234'), offering.course_versions
  end

  # "Unit tests", parameterized so they test both types of content roots (Scripts and UnitGroups).
  [:unit, :unit_group].each do |content_root_type|
    test "add_course_offering creates CourseOffering and CourseVersion for #{content_root_type}" do
      family_name = 'csz'
      version_year = '2050'
      content_root = create content_root_type, family_name: family_name, version_year: version_year
      content_root.is_course = true if content_root_type == :unit

      offering = CourseOffering.add_course_offering(content_root)

      assert_equal offering.key, family_name
      assert_equal offering.display_name, family_name
      assert_equal offering, CourseOffering.find_by(key: family_name)
      assert_equal offering.course_versions, [CourseVersion.find_by(course_offering: offering, key: version_year)]
    end

    test "add_course_offering updates existing CourseOffering and CourseVersion for #{content_root_type}" do
      offering = course_offering_with_versions(1, "with_#{content_root_type}".to_sym)
      content_root = offering.course_versions.first.content_root
      old_offering_key = offering.key
      old_version_year = offering.course_versions.first.key

      content_root.family_name = 'csz'
      content_root.version_year = '2050'
      content_root.save
      CourseOffering.add_course_offering(content_root)
      content_root.reload

      assert_equal content_root.version_year, content_root.course_version.key
      assert_equal content_root.family_name, content_root.course_version.course_offering.key
      assert_nil CourseVersion.find_by(course_offering: offering, key: old_version_year) # old CourseVersion should be deleted
      assert_nil CourseOffering.find_by(key: old_offering_key) # old CourseOffering should be deleted
    end

    test "add_course_offering updates existing CourseOffering with multiple CourseVersion for #{content_root_type}" do
      offering = course_offering_with_versions(2, "with_#{content_root_type}".to_sym)
      content_root = offering.course_versions.first.content_root
      old_offering_key = offering.key
      old_version_year = offering.course_versions.first.key

      content_root.family_name = 'csz'
      content_root.version_year = '2050'
      content_root.save
      CourseOffering.add_course_offering(content_root)
      content_root.reload

      assert_equal content_root.version_year, content_root.course_version.key
      assert_equal content_root.family_name, content_root.course_version.course_offering.key
      assert_nil CourseVersion.find_by(course_offering: offering, key: old_version_year) # old CourseVersion should be deleted
      assert_equal 1, CourseOffering.find_by(key: old_offering_key).course_versions.length # old CourseOffering should have 1 version left
    end

    test "add_course_version deletes CourseOffering and CourseVersion if is_course is changed to false for #{content_root_type}" do
      offering = course_offering_with_versions(1, "with_#{content_root_type}".to_sym)
      content_root = offering.course_versions.first.content_root
      old_offering_key = offering.key
      old_version_year = offering.course_versions.first.key

      content_root.family_name = content_root.version_year = nil
      content_root.is_course = false if content_root_type == :unit
      content_root.save
      offering = CourseOffering.add_course_offering(content_root)

      assert_nil offering
      assert_nil content_root.course_version
      assert_nil CourseVersion.find_by(key: old_version_year)
      assert_nil CourseOffering.find_by(key: old_offering_key)
    end

    test "add_course_version deletes CourseVersion but not CourseOffering if is_course is changed to false for #{content_root_type} but other versions remain" do
      offering = course_offering_with_versions(2, "with_#{content_root_type}".to_sym)
      content_root = offering.course_versions.first.content_root
      old_offering_key = offering.key
      old_version_year = offering.course_versions.first.key

      content_root.family_name = content_root.version_year = nil
      content_root.is_course = false if content_root_type == :unit
      content_root.save
      offering = CourseOffering.add_course_offering(content_root)

      assert_nil offering
      assert_nil content_root.course_version
      assert_nil CourseVersion.find_by(key: old_version_year)
      assert_equal 1, CourseOffering.find_by(key: old_offering_key).course_versions.length # old CourseOffering should have 1 version left
    end

    test "add_course_offering does nothing if is_course is false for #{content_root_type}" do
      num_course_offerings = CourseOffering.count
      num_course_versions = CourseVersion.count
      content_root = create content_root_type

      offering = CourseOffering.add_course_offering(content_root)

      assert_nil offering
      assert_nil content_root.course_version
      assert_equal num_course_offerings, CourseOffering.count
      assert_equal num_course_versions, CourseVersion.count
    end
  end

  test "enforces key format" do
    course_offering = build :course_offering, key: 'invalid key'
    refute course_offering.valid?
    course_offering.key = '0123456789abcdefghijklmnopqrstuvwxyz-'
    assert course_offering.valid?
  end

  def course_offering_with_versions(num_versions, content_root_trait=:with_unit_group)
    create :course_offering do |offering|
      create_list :course_version, num_versions, content_root_trait, course_offering: offering
    end
  end
end
