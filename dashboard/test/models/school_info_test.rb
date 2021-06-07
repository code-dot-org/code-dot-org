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

  test 'non-US with nonexistent type fails' do
    school_info = build :school_info_non_us, school_type: 'fake type'
    refute school_info.valid?
    assert_equal 'School type is invalid', school_info.errors.full_messages.first
  end

  # US

  test "US without school type fails" do
    school_info = build :school_info_us
    refute school_info.valid?  # Run the validations and set errors
    assert_equal 'School type is required', school_info.errors.full_messages.first
  end

  test "US with invalid school type fails" do
    school_info = build :school_info_us, school_type: 'fake type'
    refute school_info.valid?  # Run the validations and set errors
    assert_equal 'School type is invalid', school_info.errors.full_messages.first
  end

  # US, private

  test 'US private with school succeeds' do
    school_info = build :school_info_with_private_school_only
    assert school_info.valid?, school_info.errors.full_messages
  end

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

  test 'US public with school succeeds' do
    school_info = build :school_info_with_public_school_only
    assert school_info.valid?, school_info.errors.full_messages
    assert_equal school_info.school_district, school_info.school.school_district
    assert_equal school_info.school_type, school_info.school.school_type
    assert_equal school_info.state, school_info.school.state
    assert_equal school_info.country, 'US'
    assert_equal school_info.validation_type, SchoolInfo::VALIDATION_FULL
  end

  test 'inconsitant school data notifies' do
    Honeybadger.expects(:notify)
    school_info = build :school_info_with_public_school_only, country: 'Different Country'
    assert school_info.valid?, school_info.errors.full_messages
  end

  test 'consitant school data does not notify' do
    Honeybadger.expects(:notify).never
    school_info = build :school_info_with_public_school_only, country: 'US'
    assert school_info.valid?, school_info.errors.full_messages
  end

  test 'auto upgrade validation type without other overwritting does not notify' do
    Honeybadger.expects(:notify).never
    school_info = build :school_info_with_public_school_only, validation_type: SchoolInfo::VALIDATION_COMPLETE
    assert school_info.valid?, school_info.errors.full_messages
  end

  test 'US public with district and school succeeds' do
    school_info = build :school_info_us_public, :with_district, :with_school
    assert school_info.valid?, school_info.errors.full_messages
  end

  test 'US public without state fails' do
    school_info = build :school_info_us_public, :with_district, state: nil
    refute school_info.valid?  # Run the validations and set errors
    assert_equal 'State is required', school_info.errors.full_messages.first
  end

  test 'US public without district fails' do
    school_info = build :school_info_us_public
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

  # Test VALIDATION_COMPLETE

  test 'US public school with school_type and name succeeds' do
    school_info = SchoolInfo.create(
      {country: 'US',
      school_type: 'public',
      school_name: 'Philly High Harmony',
      validation_type: SchoolInfo::VALIDATION_COMPLETE}
    )
    assert school_info.valid? school_info.errors.full_messages
  end

  test 'School info with only school type and name school does not succeed' do
    school_info = SchoolInfo.create(
      {country: nil,
      school_type: 'private',
      school_name: 'Grovers Academy',
      validation_type: SchoolInfo::VALIDATION_COMPLETE}
    )
    refute school_info.valid?
    assert_equal 'Country is required', school_info.errors.full_messages.first
  end

  test 'US private school with only school type does not succeed' do
    school_info = SchoolInfo.create(
      {country: 'US',
      school_type: 'private',
      school_name: '',
      validation_type: SchoolInfo::VALIDATION_COMPLETE}
    )
    refute school_info.valid?
    assert_equal 'School name cannot be blank', school_info.errors.full_messages.first
  end

  # US, charter

  test 'US charter with school succeeds' do
    school_info = build :school_info_with_charter_school_only
    assert school_info.valid?, school_info.errors.full_messages
  end

  test 'US charter with district and school succeeds' do
    school_info = build :school_info_us_charter, :with_district, :with_school
    assert school_info.valid?, school_info.errors.full_messages
  end

  test 'US charter without state fails' do
    school_info = build :school_info_us_charter, :with_district, state: nil
    refute school_info.valid?  # Run the validations and set errors
    assert_equal 'State is required', school_info.errors.full_messages.first
  end

  test 'US charter without district fails' do
    school_info = build :school_info_us_charter
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

  # Homeschool and after school tests are anemic because they are only currently options on the
  # registrations page, where we do not validate data completeness

  # US homeschool

  test 'US homeschool succeeds' do
    school_info = build :school_info_us_homeschool, validation_type: SchoolInfo::VALIDATION_COMPLETE
    assert school_info.valid?, school_info.errors.full_messages
  end

  # US after school

  test 'US after school succeeds' do
    school_info = build :school_info_us_after_school, validation_type: SchoolInfo::VALIDATION_COMPLETE
    assert school_info.valid?, school_info.errors.full_messages
  end

  # Non-US homeschool

  test 'Non-US homeschool succeeds' do
    school_info = build :school_info_non_us_homeschool, validation_type: SchoolInfo::VALIDATION_COMPLETE
    assert school_info.valid?, school_info.errors.full_messages
  end

  # Non-US after school

  test 'Non-US after school succeeds' do
    school_info = build :school_info_non_us_after_school, validation_type: SchoolInfo::VALIDATION_COMPLETE
    assert school_info.valid?, school_info.errors.full_messages
  end

  # Zip code validation

  test 'US charter with non-numeric zip code fails' do
    school_info = build :school_info_us_charter, :with_district, school_other: true, zip: 'abcde', school_name: "Another School"
    refute school_info.valid?
    assert_equal 'Zip Invalid zip code', school_info.errors.full_messages.first
  end

  test 'US charter with over 5 digit zip code fails' do
    school_info = build :school_info_us_charter, :with_district, school_other: true, zip: 136_177_321_812, school_name: "Another School"
    refute school_info.valid?
    assert_equal 'Zip Invalid zip code', school_info.errors.full_messages.first
  end

  test 'US charter with negative zip code fails' do
    school_info = build :school_info_us_charter, :with_district, school_other: true, zip: -98144, school_name: "Another School"
    refute school_info.valid?
    assert_equal 'Zip Invalid zip code', school_info.errors.full_messages.first
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

  # Validation-suppression: this is required so that dashboard signups can make all school info
  # fields optional while we A/B test the presence of that field on the signup form

  test 'non-US without name succeeds when validation is suppressed' do
    school_info = build :school_info_non_us, school_name: nil, validation_type: SchoolInfo::VALIDATION_NONE
    assert school_info.valid?, school_info.errors.full_messages
  end

  test 'non-US without address succeeds when validation is suppressed' do
    school_info = build :school_info_non_us, full_address: nil, validation_type: SchoolInfo::VALIDATION_NONE
    assert school_info.valid?, school_info.errors.full_messages
  end

  test 'US private without state succeeds when validation is suppressed' do
    school_info = build :school_info_us_private, state: nil, validation_type: SchoolInfo::VALIDATION_NONE
    assert school_info.valid?, school_info.errors.full_messages
  end

  test 'US private without zip succeeds when validation is suppressed' do
    school_info = build :school_info_us_private, zip: nil, validation_type: SchoolInfo::VALIDATION_NONE
    assert school_info.valid?, school_info.errors.full_messages
  end

  test 'By default, validation type is set to full' do
    school_info = build :school_info_us_public
    assert school_info.validation_type == SchoolInfo::VALIDATION_FULL, school_info.validation_type
  end

  test 'effective_school_district_name' do
    school_district = build :school_district, name: 'Standard District'
    school_info_standard_district = build :school_info_us_public, school_district: school_district
    school_info_custom_district = build :school_info_us_public, school_district_other: true, school_district_name: 'Custom District'

    assert_equal 'Standard District', school_info_standard_district.effective_school_district_name
    assert_equal 'Custom District', school_info_custom_district.effective_school_district_name
  end

  test 'effective_school_name' do
    school = build :public_school, name: 'Standard School'
    school_info_standard_school = build :school_info_us_public, school: school
    school_info_custom_school = build :school_info_us_public, school_other: true, school_name: 'Custom School'

    assert_equal 'Standard School', school_info_standard_school.effective_school_name
    assert_equal 'Custom School', school_info_custom_school.effective_school_name
  end

  test 'school_info factory build does not persist dependencies' do
    assert_does_not_create School do
      assert_does_not_create SchoolDistrict do
        build :school_info
      end
    end
  end

  test 'school_info factory create does persist dependencies' do
    assert_creates School do
      assert_creates SchoolDistrict do
        create :school_info
      end
    end
  end

  test 'complete if all school info is provided' do
    school_info = SchoolInfo.new
    school_info.country = 'United States'
    school_info.school_type = SchoolInfo::SCHOOL_TYPE_PUBLIC
    school_info.school_name = 'Primary School'
    school_info.full_address = '123 Sesame Street'

    assert_nil school_info.school_id
    refute_nil school_info.school_name
    refute_nil school_info.full_address
    assert school_info.complete?
  end

  test 'complete if all school info but location is provided' do
    school_info = SchoolInfo.new
    school_info.country = 'United States'
    school_info.school_type = SchoolInfo::SCHOOL_TYPE_PUBLIC
    school_info.school_name = 'Primary School'

    assert_nil school_info.school_id
    refute_nil school_info.school_name
    assert_nil school_info.full_address

    assert school_info.complete?
  end

  test 'complete if school is found by NCES id' do
    school_info = SchoolInfo.new
    school_info.school_id = 1

    refute_nil school_info.school_id
    assert school_info.complete?
  end

  test 'complete if school type is homeschool/after school/organization/other' do
    school_info = SchoolInfo.new
    school_info.country = 'United States'

    school_info.school_type = SchoolInfo::SCHOOL_TYPE_HOMESCHOOL
    assert school_info.complete?

    school_info.school_type = SchoolInfo::SCHOOL_TYPE_AFTER_SCHOOL
    assert school_info.complete?

    school_info.school_type = SchoolInfo::SCHOOL_TYPE_ORGANIZATION
    assert school_info.complete?

    school_info.school_type = SchoolInfo::SCHOOL_TYPE_OTHER
    assert school_info.complete?
  end

  test 'complete if country is not US' do
    school_info = SchoolInfo.new
    school_info.country = 'Canada'
    assert school_info.complete?
  end

  test 'not complete without country' do
    school_info = SchoolInfo.new
    assert_nil school_info.country
    refute school_info.complete?
  end

  test 'not complete if country is US but no school type is set' do
    school_info = SchoolInfo.new
    school_info.country = 'United States'
    assert_nil school_info.school_type
    refute school_info.complete?
  end

  test 'not complete if country is US and school type is public/private/charter but other information is missing' do
    school_info = SchoolInfo.new
    school_info.country = 'United States'
    school_info.school_type = SchoolInfo::SCHOOL_TYPE_PUBLIC
    refute school_info.complete?

    school_info.school_type = SchoolInfo::SCHOOL_TYPE_PRIVATE
    refute school_info.complete?

    school_info.school_type = SchoolInfo::SCHOOL_TYPE_CHARTER
    refute school_info.complete?
  end

  test 'not complete if name is entirely whitespace' do
    school_info = SchoolInfo.new
    school_info.country = 'United States'
    school_info.school_type = SchoolInfo::SCHOOL_TYPE_PUBLIC
    school_info.school_name = 'Primary School'
    assert school_info.complete?

    school_info.school_name = '     '
    refute school_info.complete?
  end

  test 'school info is readonly for an existing record' do
    school_info = SchoolInfo.new
    school_info.country = 'United States'
    school_info.school_type = SchoolInfo::SCHOOL_TYPE_PUBLIC
    school_info.school_name = 'Primary School'
    school_info.validation_type = SchoolInfo::VALIDATION_COMPLETE
    school_info.save!

    assert_raises("ActiveRecord::ReadOnlyRecord") do
      school_info.update(country: 'United States', school_type: SchoolInfo::SCHOOL_TYPE_PRIVATE)
    end
  end
end
