require 'test_helper'

class Census::IbSchoolCodeTest < ActiveSupport::TestCase
  test "Basic IB school code creation succeeds" do
    school_code = build :ib_school_code
    assert school_code.valid?, school_code.errors.full_messages
  end

  test "IB school code creation with invalid school_code fails" do
    school_code = build :ib_school_code, :with_invalid_school_code
    refute school_code.valid?
  end

  test "IB school code creation with too long school_code fails" do
    school_code = build :ib_school_code, :with_too_long_school_code
    refute school_code.valid?
  end

  test "IB school code creation without school_code fails" do
    school_code = build :ib_school_code, :without_school_code
    refute school_code.valid?
  end

  test "IB school code creation without school fails" do
    school_code = build :ib_school_code, :without_school
    refute school_code.valid?
  end

  test "normalize_school_code works with leading zeros" do
    school_code = Census::IbSchoolCode.normalize_school_code("000123")
    assert_equal "000123", school_code
  end

  test "normalize_school_code works without leading zeros" do
    school_code = Census::IbSchoolCode.normalize_school_code("123")
    assert_equal "000123", school_code
  end

  test "normalize_school_code works with partial leading zeros" do
    school_code = Census::IbSchoolCode.normalize_school_code("0123")
    assert_equal "000123", school_code
  end
end
