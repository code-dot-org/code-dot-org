require 'test_helper'

class Census::ApSchoolCodeTest < ActiveSupport::TestCase
  test "Basic AP school code creation succeeds" do
    school_code = build :ap_school_code
    assert school_code.valid?, school_code.errors.full_messages
  end

  test "AP school code creation with too long school_code fails" do
    school_code = build :ap_school_code, :with_too_long_school_code
    refute school_code.valid?
  end

  test "AP school code creation with invalid school_code fails" do
    school_code = build :ap_school_code, :with_invalid_school_code
    refute school_code.valid?
  end

  test "AP school code creation without school_code fails" do
    school_code = build :ap_school_code, :without_school_code
    refute school_code.valid?
  end

  test "AP school code creation without school fails" do
    school_code = build :ap_school_code, :without_school
    refute school_code.valid?
  end
end
