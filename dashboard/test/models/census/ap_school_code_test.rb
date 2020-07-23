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

  test "normalize_school_code works with leading zeros" do
    school_code = Census::ApSchoolCode.normalize_school_code("000123")
    assert_equal "000123", school_code
  end

  test "normalize_school_code works without leading zeros" do
    school_code = Census::ApSchoolCode.normalize_school_code("123")
    assert_equal "000123", school_code
  end

  test "normalize_school_code works with partial leading zeros" do
    school_code = Census::ApSchoolCode.normalize_school_code("0123")
    assert_equal "000123", school_code
  end

  test "AP school code year is missing fails" do
    school_code = build :ap_school_code, :without_school_year
    refute school_code.valid?
  end

  test "AP school code year is invalid fails" do
    school_code = build :ap_school_code, :with_invalid_school_year
    refute school_code.valid?
  end

  test "Composite key relationship between AP school code and AP CS offering" do
    school = create :census_school

    # Different AP school codes for the same school in different school years
    school_code_1 = create :ap_school_code,
      school: school,
      school_code: '888888',
      school_year: 2016
    school_code_2 = create :ap_school_code,
      school: school,
      school_code: '999999',
      school_year: 2017

    ap_cs_offering_1 = create :ap_cs_offering,
      school_code: school_code_1.school_code,
      school: school,
      school_year: 2016
    create :ap_cs_offering,
      school_code: school_code_2.school_code,
      school_year: 2017,
      course: 'CSP'
    create :ap_cs_offering,
      school_code: school_code_2.school_code,
      school_year: 2017,
      course: 'CSA'

    assert_equal school_code_1.ap_cs_offering.count, 1
    assert_equal school_code_1.ap_cs_offering.first, ap_cs_offering_1
    assert_equal school_code_2.ap_cs_offering.count, 2
  end
end
