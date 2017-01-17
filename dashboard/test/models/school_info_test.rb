require 'test_helper'

class SchoolInfoTest < ActiveSupport::TestCase
  # New data formats (with country). The presence of the country column is the marker that the record
  # conforms to the newer data format outlined in this spec: https://goo.gl/Gw57rL .

  # non-US

  test 'non-US with type, name and address succeeds' do
    school_info = build :school_info_non_us
    assert school_info.valid?, school_info.errors.full_messages
  end

  test 'non-US without address fails' do
    school_info = build :school_info_non_us, full_address: nil
    refute school_info.valid?  # Run the validations and set errors
    assert_equal 'Full address is required', school_info.errors.full_messages.first
  end

  test 'non-US without name fails' do
    school_info = build :school_info_non_us, school_name: nil
    refute school_info.valid?  # Run the validations and set errors
    assert_equal 'School name is required', school_info.errors.full_messages.first
  end

  test 'non-US without type fails' do
    school_info = build :school_info_non_us, school_type: nil
    refute school_info.valid?  # Run the validations and set errors
    assert_equal 'School type is required', school_info.errors.full_messages.first
  end

  # US

  test "US without school type fails" do
    school_info = build :school_info_us
    refute school_info.valid?  # Run the validations and set errors
    assert_equal 'School type is required', school_info.errors.full_messages.first
  end

  # US, private

  test 'US private with zip and school name succeeds' do
    school_info = build :school_info_us_private
    assert school_info.valid?, school_info.errors.full_messages
  end

  test 'US private without state fails' do
    school_info = build :school_info_us_private, state: nil
    refute school_info.valid?  # Run the validations and set errors
    assert_equal 'State is required', school_info.errors.full_messages.first
  end

  test 'US private without zip fails' do
    school_info = build :school_info_us_private, zip: nil
    refute school_info.valid?  # Run the validations and set errors
    assert_equal 'Zip is required', school_info.errors.full_messages.first
  end

  # make sure empty strings are converted to nil
  test 'US private with empty zip fails' do
    school_info = build :school_info_us_private, zip: ''
    refute school_info.valid?  # Run the validations and set errors
    assert_equal 'Zip is required', school_info.errors.full_messages.first
  end

  test 'US private without school name fails' do
    school_info = build :school_info_us_private, school_name: nil
    refute school_info.valid?  # Run the validations and set errors
    assert_equal 'School name is required', school_info.errors.full_messages.first
  end

  # US, other

  test 'US other with zip and school name succeeds' do
    school_info = build :school_info_us_other
    assert school_info.valid?, school_info.errors.full_messages
  end

  test 'US other without state fails' do
    school_info = build :school_info_us_other, state: nil
    refute school_info.valid?  # Run the validations and set errors
    assert_equal 'State is required', school_info.errors.full_messages.first
  end

  test 'US other without zip fails' do
    school_info = build :school_info_us_other, zip: nil
    refute school_info.valid?  # Run the validations and set errors
    assert_equal 'Zip is required', school_info.errors.full_messages.first
  end

  test 'US other without school name fails' do
    school_info = build :school_info_us_other, school_name: nil
    refute school_info.valid?  # Run the validations and set errors
    assert_equal 'School name is required', school_info.errors.full_messages.first
  end

  # US, public

  test 'US public with district and school succeeds' do
    school_info = build :school_info_us_public, :with_district, :with_school
    assert school_info.valid?, school_info.errors.full_messages
  end

  test 'US public without state fails' do
    school_info = build :school_info_us_public, :with_district, :with_school, state: nil
    refute school_info.valid?  # Run the validations and set errors
    assert_equal 'State is required', school_info.errors.full_messages.first
  end

  test 'US public without district fails' do
    school_info = build :school_info_us_public, :with_school
    refute school_info.valid?  # Run the validations and set errors
    assert_equal 'School district is required', school_info.errors.full_messages.first
  end

  test 'US public with district but no school fails' do
    school_info = build :school_info_us_public, :with_district
    refute school_info.valid?  # Run the validations and set errors
    assert_equal 'School is required', school_info.errors.full_messages.first
  end

  test 'US public with other district succeeds' do
    school_info = build :school_info_us_public, school_district_other: true, school_district_name: 'Another District', zip: 12345, school_name: 'Another School'
    assert school_info.valid?, school_info.errors.full_messages
  end

  test 'US public with other district but no zip fails' do
    school_info = build :school_info_us_public, school_district_other: true, school_district_name: 'Another District', school_name: 'Another School'
    refute school_info.valid?  # Run the validations and set errors
    assert_equal 'Zip is required', school_info.errors.full_messages.first
  end

  test 'US public with other district but no district name fails' do
    school_info = build :school_info_us_public, school_district_other: true, zip: 12345, school_name: 'Another School'
    refute school_info.valid?  # Run the validations and set errors
    assert_equal 'School district name is required', school_info.errors.full_messages.first
  end

  test 'US public with other district but no school name fails' do
    school_info = build :school_info_us_public, school_district_other: true, school_district_name: 'Another District', zip: 12345
    refute school_info.valid?  # Run the validations and set errors
    assert_equal 'School name is required', school_info.errors.full_messages.first
  end

  test 'US public with other school succeeds' do
    school_info = build :school_info_us_public, :with_district, school_other: true, zip: 12345, school_name: "Another School"
    assert school_info.valid?, school_info.errors.full_messages
  end

  test 'US public with other school but no zip fails' do
    school_info = build :school_info_us_public, :with_district, school_other: true, school_name: "Another School"
    refute school_info.valid?  # Run the validations and set errors
    assert_equal 'Zip is required', school_info.errors.full_messages.first
  end

  test 'US public with other school but no school name fails' do
    school_info = build :school_info_us_public, :with_district, school_other: true, zip: 12345
    refute school_info.valid?  # Run the validations and set errors
    assert_equal 'School name is required', school_info.errors.full_messages.first
  end

  # US, charter

  test 'US charter with district and school succeeds' do
    school_info = build :school_info_us_charter, :with_district, :with_school
    assert school_info.valid?, school_info.errors.full_messages
  end

  test 'US charter without state fails' do
    school_info = build :school_info_us_charter, :with_district, :with_school, state: nil
    refute school_info.valid?  # Run the validations and set errors
    assert_equal 'State is required', school_info.errors.full_messages.first
  end

  test 'US charter without district fails' do
    school_info = build :school_info_us_charter, :with_school
    refute school_info.valid?  # Run the validations and set errors
    assert_equal 'School district is required', school_info.errors.full_messages.first
  end

  test 'US charter with district but no school fails' do
    school_info = build :school_info_us_charter, :with_district
    refute school_info.valid?  # Run the validations and set errors
    assert_equal 'School is required', school_info.errors.full_messages.first
  end

  test 'US charter with other district succeeds' do
    school_info = build :school_info_us_charter, school_district_other: true, school_district_name: 'Another District', zip: 12345, school_name: 'Another School'
    assert school_info.valid?, school_info.errors.full_messages
  end

  test 'US charter with other district but no zip fails' do
    school_info = build :school_info_us_charter, school_district_other: true, school_district_name: 'Another District', school_name: 'Another School'
    refute school_info.valid?  # Run the validations and set errors
    assert_equal 'Zip is required', school_info.errors.full_messages.first
  end

  test 'US charter with other district but no district name fails' do
    school_info = build :school_info_us_charter, school_district_other: true, zip: 12345, school_name: 'Another School'
    refute school_info.valid?  # Run the validations and set errors
    assert_equal 'School district name is required', school_info.errors.full_messages.first
  end

  test 'US charter with other district but no school name fails' do
    school_info = build :school_info_us_charter, school_district_other: true, school_district_name: 'Another District', zip: 12345
    refute school_info.valid?  # Run the validations and set errors
    assert_equal 'School name is required', school_info.errors.full_messages.first
  end

  test 'US charter with other school succeeds' do
    school_info = build :school_info_us_charter, :with_district, school_other: true, zip: 12345, school_name: "Another School"
    assert school_info.valid?, school_info.errors.full_messages
  end

  test 'US charter with other school but no zip fails' do
    school_info = build :school_info_us_charter, :with_district, school_other: true, school_name: "Another School"
    refute school_info.valid?  # Run the validations and set errors
    assert_equal 'Zip is required', school_info.errors.full_messages.first
  end

  test 'US charter with other school but no school name fails' do
    school_info = build :school_info_us_charter, :with_district, school_other: true, zip: 12345
    refute school_info.valid?  # Run the validations and set errors
    assert_equal 'School name is required', school_info.errors.full_messages.first
  end

  # deprecated data formats (without country). The absence of the country column is the marker that
  # the record does NOT conform to the newer data format. These older records may belong to a Pd::Enrollment,
  # in which case the school name should be stored in enrollment.school, NOT in enrollment.school_info.school_name.
  #
  # These older records should be migrated to the newer format. However, doing so for public and charter schools
  # will require identifying the exact school from the schools table based on whatever free response text the
  # workshop attendee entered as the "school name" when they signed up using the old workshop sign-up ui (plus
  # any state or district info they entered). The plan to migrate this data includes:
  # 1. re-prompting users to enter data in the new format
  # 2. doing an automated migration with fuzzy-matching in hopes of matching ~80% of remaining entries to schools
  # 3. doing a manual pass to match as much of the remaining data to specific schools as possible

  # charter + zip  --  success
  test 'district by type charter and zip, validation succeeds' do
    school_info = build :school_info_without_country, school_type: SchoolInfo::SCHOOL_TYPE_CHARTER, school_zip: 98144, school_state: nil, school_district_id: nil
    assert school_info.valid?
  end

  # private + zip  --  success
  test 'district by type private and zip, validation succeeds' do
    school_info = build :school_info_without_country, school_type: SchoolInfo::SCHOOL_TYPE_PRIVATE, school_zip: 98144, school_state: nil, school_district_id: nil
    assert school_info.valid?
  end

  # public + state "other"  --  success
  test 'district by type public and state other, validation succeeds' do
    school_info = build :school_info_without_country, school_type: SchoolInfo::SCHOOL_TYPE_PUBLIC, school_state: SchoolInfo::SCHOOL_STATE_OTHER, school_district_id: nil
    assert school_info.valid?
  end

  # public + state + district  --  success
  test 'district by type public and state and district, validation succeeds' do
    school_info = build :school_info_without_country, school_type: SchoolInfo::SCHOOL_TYPE_PUBLIC, school_state: "WA", school_district_id: create(:school_district).id
    assert school_info.valid?
  end

  # public + state + district "other"  --  success
  test 'district by type public and state and district other, validation succeeds' do
    school_info = build :school_info_without_country, school_type: SchoolInfo::SCHOOL_TYPE_PUBLIC, school_state: "WA", school_district_other: true, school_district_id: nil
    assert school_info.valid?
  end

  # other + state "other"  --  success
  test 'district by type other and state other, validation succeeds' do
    school_info = build :school_info_without_country, school_type: SchoolInfo::SCHOOL_TYPE_OTHER, school_state: SchoolInfo::SCHOOL_STATE_OTHER, school_district_id: nil
    assert school_info.valid?
  end

  # other + state + district  --  success
  test 'district by type other and state and district, validation succeeds' do
    school_info = build :school_info_without_country, school_type: SchoolInfo::SCHOOL_TYPE_OTHER, school_state: "WA", school_district_id: create(:school_district).id
    assert school_info.valid?
  end

  # other + state + district "other"  --  success
  test 'district by type other and state and district other, validation succeeds' do
    school_info = build :school_info_without_country, school_type: SchoolInfo::SCHOOL_TYPE_OTHER, school_state: "WA", school_district_other: true, school_district_id: nil
    assert school_info.valid?
  end

  # charter + no zip  --  fail
  test 'district by type charter and no zip, validation fails' do
    school_info = build :school_info_without_country, school_type: SchoolInfo::SCHOOL_TYPE_CHARTER, school_zip: nil, school_district_id: nil, school_district_other: nil, school_state: nil
    refute school_info.valid?  # Run the validations and set errors
    assert_equal 'School district is required', school_info.errors.full_messages.first
  end

  # private + no zip  --  fail
  test 'district by type private and no zip, validation fails' do
    school_info = build :school_info_without_country, school_type: SchoolInfo::SCHOOL_TYPE_PRIVATE, school_zip: nil, school_state: nil, school_district_id: nil
    refute school_info.valid?  # Run the validations and set errors
    assert_equal 'School district is required', school_info.errors.full_messages.first
  end

  # public + state "not other" + no district + no district "other"  --  fail
  test 'district by type public and state but no district, validation fails' do
    school_info = build :school_info_without_country, school_type: SchoolInfo::SCHOOL_TYPE_PUBLIC, school_state: "WA", school_district_id: nil, school_district_other: false
    refute school_info.valid?  # Run the validations and set errors
    assert_equal 'School district is required', school_info.errors.full_messages.first
  end

  # other + state "not other" + no district + no district "other"  --  fail
  test 'district by type other and state but no district, validation fails' do
    school_info = build :school_info_without_country, school_type: SchoolInfo::SCHOOL_TYPE_OTHER, school_state: "WA", school_district_id: nil, school_district_other: false
    refute school_info.valid?  # Run the validations and set errors
    assert_equal 'School district is required', school_info.errors.full_messages.first
  end
end
