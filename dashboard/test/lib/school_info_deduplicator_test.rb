require 'test_helper'

class SchoolInfoDeduplicatorTest < ActiveSupport::TestCase
  class MockSchoolInfoDeduplicator
    include SchoolInfoDeduplicator
    attr_accessor :school_info
  end

  test 'country and school type and state' do
    deduplicator = MockSchoolInfoDeduplicator.new
    expect = {
      country: 'US',
      school_type: 'public',
      state: 'AK',
      zip: nil,
      school_district_id: nil,
      school_district_other: nil,
      school_district_name: nil,
      school_id: nil,
      school_other: nil,
      school_name: nil,
      full_address: nil,
      validation_type: 'none'
    }
    actual = {
      country: 'US',
      school_type: 'public',
      school_state: 'AK',
      school_zip: '',
      school_district_name: '',
      school_name: '',
      full_address: '',
      validation_type: 'none'
    }
    assert_equal expect, deduplicator.process_school_info_attributes(actual)
  end

  test 'country and type and state and school id' do
    deduplicator = MockSchoolInfoDeduplicator.new
    expect = {
      country: 'US',
      school_type: 'public',
      state: 'AK',
      zip: nil,
      school_district_id: '200001',
      school_district_other: nil,
      school_district_name: nil,
      school_id: '20000100207',
      school_other: nil,
      school_name: nil,
      full_address: nil,
      validation_type: 'none'
    }
    actual = {
      country: 'US',
      school_type: 'public',
      school_state: 'AK',
      school_zip: '',
      school_district_id: '200001',
      school_district_name: '',
      school_id: '20000100207',
      school_name: '',
      full_address: '',
      validation_type: 'none'
    }
    assert_equal expect, deduplicator.process_school_info_attributes(actual)
  end

  test 'with school district id' do
    deduplicator = MockSchoolInfoDeduplicator.new
    expect = {
      country: 'US',
      school_type: 'public',
      state: 'AK',
      zip: nil,
      school_district_id: '200003',
      school_district_other: nil,
      school_district_name: nil,
      school_id: nil,
      school_other: nil,
      school_name: nil,
      full_address: nil,
      validation_type: 'none'
    }
    actual = {
      country: 'US',
      school_type: 'public',
      school_state: 'AK',
      school_zip: '',
      school_district_id: '200003',
      school_district_name: '',
      school_id: '',
      school_name: '',
      full_address: '',
      validation_type: 'none'
    }
    assert_equal expect, deduplicator.process_school_info_attributes(actual)
  end

  test 'with other school name' do
    deduplicator = MockSchoolInfoDeduplicator.new
    expect = {
      country: 'US',
      school_type: 'public',
      state: 'AK',
      zip: nil,
      school_district_id: '200003',
      school_district_other: nil,
      school_district_name: nil,
      school_id: nil,
      school_other: true,
      school_name: 'Test School Name',
      full_address: nil,
      validation_type: 'none'
    }
    actual = {
      country: 'US',
      school_type: 'public',
      school_state: 'AK',
      school_zip: '',
      school_district_id: '200003',
      school_district_name: '',
      school_other: 'true',
      school_name: 'Test School Name',
      full_address: '',
      validation_type: 'none'
    }
    assert_equal expect, deduplicator.process_school_info_attributes(actual)
  end

  test 'without other school name' do
    deduplicator = MockSchoolInfoDeduplicator.new
    expect = {
      country: 'US',
      school_type: 'public',
      state: 'AK',
      zip: nil,
      school_district_id: '200003',
      school_district_other: nil,
      school_district_name: nil,
      school_id: nil,
      school_other: true,
      school_name: nil,
      full_address: nil,
      validation_type: 'none'
    }
    actual = {
      country: 'US',
      school_type: 'public',
      school_state: 'AK',
      school_zip: '',
      school_district_id: '200003',
      school_district_name: '',
      school_other: 'true',
      school_name: '',
      full_address: '',
      validation_type: 'none'
    }
    assert_equal expect, deduplicator.process_school_info_attributes(actual)
  end

  test 'dedupe with school, ignoring other attrs' do
    deduplicator = MockSchoolInfoDeduplicator.new
    school_info = create :school_info_with_public_school_only
    deduped = deduplicator.deduplicate_school_info({school_id: school_info.school_id, validation_type: SchoolInfo::VALIDATION_NONE, state: "FAKE"}, deduplicator)
    assert deduped, "Expected to dedupe on school id"
    assert_equal school_info.id, deduplicator.school_info.id
  end

  test 'missing or blank fields do not match none-null values' do
    deduplicator = MockSchoolInfoDeduplicator.new
    existing = create :school_info_us_private, validation_type: SchoolInfo::VALIDATION_NONE
    new_attrs = {
      country: existing.country,
      validation_type: SchoolInfo::VALIDATION_NONE,
    }
    duplicate = deduplicator.get_duplicate_school_info(new_attrs)
    refute duplicate, "Did not expect to find a school info matching #{new_attrs}. Found #{duplicate.inspect}"
  end

  test 'missing or blank fields with defaults do match' do
    deduplicator = MockSchoolInfoDeduplicator.new
    existing = create :school_info_us_private
    new_attrs = {
      country: existing.country,
      school_type: existing.school_type,
      state: existing.state,
      zip: existing.zip,
      school_district_id: existing.school_district_id,
      school_district_other: nil,
      school_district_name: existing.school_district_name,
      school_id: existing.school_id,
      school_other: existing.school_other,
      school_name: existing.school_name,
      full_address: existing.full_address,
      validation_type: nil
    }
    duplicate = deduplicator.get_duplicate_school_info(new_attrs)
    assert_equal existing, duplicate
  end
end
