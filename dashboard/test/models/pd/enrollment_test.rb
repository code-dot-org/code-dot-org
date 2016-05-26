require 'test_helper'

class Pd::EnrollmentTest < ActiveSupport::TestCase

  test 'code' do
    enrollment1 = create :pd_enrollment
    enrollment2 = create :pd_enrollment

    refute_nil enrollment1.code
    refute_nil enrollment2.code
    refute_equal enrollment1.code, enrollment2.code
  end

  test 'find by code' do
    enrollment = create :pd_enrollment

    found_enrollment = Pd::Enrollment.find_by(code: enrollment.code)
    assert_equal enrollment, found_enrollment
  end

  test 'district and state, but no zip, validation success' do
    # If there's a district and state, but no zip, then success.
    enrollment = build :pd_enrollment, school_district_id: create(:school_district).id, school_state: "WA", school_zip: nil
    assert enrollment.valid?
    assert_equal 0, enrollment.errors.messages.count
  end

  test 'no district and state, but zip, validation success' do
    # If there's no district or state, but a zip, then success.
    enrollment = build :pd_enrollment, school_district_id: nil, school_state: nil, school_zip: 98101
    assert enrollment.valid?
    assert_equal 0, enrollment.errors.messages.count
  end

  test 'district but no state, and no zip, validation error' do
    # If there's a district but no state, and no zip, then error.
    enrollment = build :pd_enrollment, school_district_id: create(:school_district).id, school_state: nil, school_zip: nil
    refute enrollment.valid?
    assert_equal 1, enrollment.errors.messages.count
    assert_equal 'School district (and state) or school ZIP is required', enrollment.errors.full_messages[0]
  end

  test 'no district and state, or zip, validation error' do
    # If there's no district & state, nor ZIP, then error.
    enrollment = build :pd_enrollment, school_district_id: nil, school_state: nil, school_zip: nil
    refute enrollment.valid?
    assert_equal 1, enrollment.errors.messages.count
    assert_equal 'School district (and state) or school ZIP is required', enrollment.errors.full_messages[0]
  end

  test 'district and state, and zip, validation error' do
    # If there's a district & state, and ZIP, then error.
    enrollment = build :pd_enrollment, school_district_id: create(:school_district).id, school_state: "WA", school_zip: 98101
    refute enrollment.valid?
    assert_equal 1, enrollment.errors.messages.count
    assert_equal 'School district (and state) or school ZIP is required', enrollment.errors.full_messages[0]
  end
end
