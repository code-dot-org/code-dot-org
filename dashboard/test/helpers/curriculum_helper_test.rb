require 'test_helper'

class CurriculumHelperTest < ActiveSupport::TestCase
  setup do
    @errors = Object.new
    @errors.stubs(:add)
    @object_to_validate = Object.new
    @object_to_validate.extend(CurriculumHelper)
    @object_to_validate.stubs(:errors).returns(@errors)
  end

  def refute_valid_key(key_value)
    @object_to_validate.stubs(:key).returns(key_value)
    refute @object_to_validate.validate_key_format
  end

  test "key cannot be blank" do
    refute_valid_key("")
  end

  test "data doc key cannot have invalid characters" do
    refute_valid_key("space character")
  end

  test "data doc key cannot start with a period" do
    refute_valid_key(".period")
  end

  test "data doc key cannot end with a period" do
    refute_valid_key("period.")
  end

  test "data doc key cannot be `new`" do
    refute_valid_key("new")
  end

  test "data doc key cannot be `edit`" do
    refute_valid_key("edit")
  end

  test "data doc is valid if requirements are met" do
    @object_to_validate.stubs(:key).returns("beautiful_key1")
    assert @object_to_validate.validate_key_format
  end

  test "find_matching_course_version" do
    standalone_unit = create :script, is_course: true
    course_version = create :course_version, content_root: standalone_unit

    assert_equal course_version, CurriculumHelper.find_matching_course_version(standalone_unit.name)

    unit_group = create :unit_group
    unit = create :script
    create :unit_group_unit, unit_group: unit_group, script: unit, position: 1
    course_version = create :course_version, content_root: unit_group

    assert_equal course_version, CurriculumHelper.find_matching_course_version(unit_group.name)
    assert_nil CurriculumHelper.find_matching_course_version(unit.name)

    assert_nil CurriculumHelper.find_matching_course_version('foo')
  end
end
