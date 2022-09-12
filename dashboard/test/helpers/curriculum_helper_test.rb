require 'test_helper'

class CurriculumHelperTest < ActiveSupport::TestCase
  setup do
    @errors = Object.new
    @errors.stubs(:add)
    @object_to_validate = Object.new
    @object_to_validate.extend(CurriculumHelper)
    @object_to_validate.stubs(:errors).returns(@errors)
  end

  test "key cannot be blank" do
    @object_to_validate.stubs(:key).returns("")
    refute @object_to_validate.validate_key_format
  end

  test "data doc key cannot have invalid characters" do
    @object_to_validate.stubs(:key).returns("space character")
    refute @object_to_validate.validate_key_format
  end

  test "data doc key cannot start with a period" do
    @object_to_validate.stubs(:key).returns(".period")
    refute @object_to_validate.validate_key_format
  end

  test "data doc key cannot end with a period" do
    @object_to_validate.stubs(:key).returns("period.")
    refute @object_to_validate.validate_key_format
  end

  test "data doc key cannot be `new`" do
    @object_to_validate.stubs(:key).returns("new")
    refute @object_to_validate.validate_key_format
  end

  test "data doc key cannot be `edit`" do
    @object_to_validate.stubs(:key).returns("edit")
    refute @object_to_validate.validate_key_format
  end

  test "data doc is valid if requirements are met" do
    @object_to_validate.stubs(:key).returns("beautiful_key1")
    assert @object_to_validate.validate_key_format
  end
end
