require 'test_helper'

class SchoolInfoTest < ActiveSupport::TestCase
  # charter + zip  --  success
  test 'district by type charter and zip, validation succeeds' do
    school_info = build :school_info, school_type: SchoolInfo::SCHOOL_TYPE_CHARTER, school_zip: 98144, school_state: nil, school_district_id: nil
    assert school_info.valid?
  end

  # private + zip  --  success
  test 'district by type private and zip, validation succeeds' do
    school_info = build :school_info, school_type: SchoolInfo::SCHOOL_TYPE_PRIVATE, school_zip: 98144, school_state: nil, school_district_id: nil
    assert school_info.valid?
  end

  # public + state "other"  --  success
  test 'district by type public and state other, validation succeeds' do
    school_info = build :school_info, school_type: SchoolInfo::SCHOOL_TYPE_PUBLIC, school_state: SchoolInfo::SCHOOL_STATE_OTHER, school_district_id: nil
    assert school_info.valid?
  end

  # public + state + district  --  success
  test 'district by type public and state and district, validation succeeds' do
    school_info = build :school_info, school_type: SchoolInfo::SCHOOL_TYPE_PUBLIC, school_state: "WA", school_district_id: create(:school_district).id
    assert school_info.valid?
  end

  # public + state + district "other"  --  success
  test 'district by type public and state and district other, validation succeeds' do
    school_info = build :school_info, school_type: SchoolInfo::SCHOOL_TYPE_PUBLIC, school_state: "WA", school_district_other: true, school_district_id: nil
    assert school_info.valid?
  end

  # other + state "other"  --  success
  test 'district by type other and state other, validation succeeds' do
    school_info = build :school_info, school_type: SchoolInfo::SCHOOL_TYPE_OTHER, school_state: SchoolInfo::SCHOOL_STATE_OTHER, school_district_id: nil
    assert school_info.valid?
  end

  # other + state + district  --  success
  test 'district by type other and state and district, validation succeeds' do
    school_info = build :school_info, school_type: SchoolInfo::SCHOOL_TYPE_OTHER, school_state: "WA", school_district_id: create(:school_district).id
    assert school_info.valid?
  end

  # other + state + district "other"  --  success
  test 'district by type other and state and district other, validation succeeds' do
    school_info = build :school_info, school_type: SchoolInfo::SCHOOL_TYPE_OTHER, school_state: "WA", school_district_other: true, school_district_id: nil
    assert school_info.valid?
  end

  # charter + no zip  --  fail
  test 'district by type charter and no zip, validation fails' do
    school_info = build :school_info, school_type: SchoolInfo::SCHOOL_TYPE_CHARTER, school_zip: nil, school_district_id: nil, school_district_other: nil, school_state: nil
    refute school_info.valid?  # Run the validations and set errors
    assert_equal 'School district is required', school_info.errors.full_messages.first
  end

  # private + no zip  --  fail
  test 'district by type private and no zip, validation fails' do
    school_info = build :school_info, school_type: SchoolInfo::SCHOOL_TYPE_PRIVATE, school_zip: nil, school_state: nil, school_district_id: nil
    refute school_info.valid?  # Run the validations and set errors
    assert_equal 'School district is required', school_info.errors.full_messages.first
  end

  # public + state "not other" + no district + no district "other"  --  fail
  test 'district by type public and state but no district, validation fails' do
    school_info = build :school_info, school_type: SchoolInfo::SCHOOL_TYPE_PUBLIC, school_state: "WA", school_district_id: nil, school_district_other: false
    refute school_info.valid?  # Run the validations and set errors
    assert_equal 'School district is required', school_info.errors.full_messages.first
  end

  # other + state "not other" + no district + no district "other"  --  fail
  test 'district by type other and state but no district, validation fails' do
    school_info = build :school_info, school_type: SchoolInfo::SCHOOL_TYPE_OTHER, school_state: "WA", school_district_id: nil, school_district_other: false
    refute school_info.valid?  # Run the validations and set errors
    assert_equal 'School district is required', school_info.errors.full_messages.first
  end
end
