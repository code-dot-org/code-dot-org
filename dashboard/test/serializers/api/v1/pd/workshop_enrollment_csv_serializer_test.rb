require 'test_helper'

class Api::V1::Pd::WorkshopEnrollmentCsvSerializerTest < ActionController::TestCase
  include Pd::Application::ActiveApplicationModels
  include Pd::EnrollmentConstants

  test 'serialized workshop enrollment has expected attributes' do
    enrollment = create(:pd_enrollment)

    expected_attributes = [
      :id, :first_name, :last_name, :email, :alternate_email, :application_id, :district_name, :school, :role,
      :grades_teaching, :attended_csf_intro_workshop, :csf_course_experience,
      :csf_courses_planned, :user_id, :attended,
      :pre_workshop_survey, :previous_courses, :attendances,
      :scholarship_status, :enrolled_date, :years_teaching, :years_teaching_cs,
      :taught_ap_before, :planning_to_teach_ap
    ]

    serialized = ::Api::V1::Pd::WorkshopEnrollmentCsvSerializer.new(enrollment).attributes
    assert_equal expected_attributes, serialized.keys
  end

  test 'prefers user fields over enrollment when present' do
    user = create(:teacher, given_name: "Given", family_name: "Family", educator_role: 'classroom_teacher')
    district = create(:school_district, name: "User District")
    school   = create(:school, name: "User School", school_district: district)
    user_si  = create(:school_info, school: school)
    user.update!(school_info: user_si)

    # Enrollment has different values that should be overridden by the user fields
    enrollment_district = create(:school_district, name: "Enrollment District")
    enrollment_school   = create(:school, name: "Enrollment School", school_district: enrollment_district)
    enrollment_si       = create(:school_info, school: enrollment_school)

    enrollment = create(
      :pd_enrollment,
      first_name: "EnrollFirst",
      last_name: "EnrollLast",
      email: "enroll@example.com",
      role: "facilitator",
      school_info: enrollment_si,
      user: user
    )

    serialized = ::Api::V1::Pd::WorkshopEnrollmentCsvSerializer.new(enrollment).attributes

    assert_equal "Given", serialized[:first_name]
    assert_equal "Family", serialized[:last_name]
    # Prefers the user's email over enrollment email
    assert_equal user.email, serialized[:email]
    # Prefers the user's educator_role over enrollment role
    assert_equal user.educator_role, serialized[:role]
    # Prefers the user's school/district
    assert_equal "User School", serialized[:school]
    assert_equal "User District", serialized[:district_name]
    assert_equal user.id, serialized[:user_id]
  end

  test 'falls back to enrollment data when user name fields are blank' do
    # Keep user valid (email/role present), but make names blank/nil which should cause fallback.
    user = create(:teacher, given_name: "", family_name: nil, educator_role: 'classroom_teacher')

    enrollment = create(
      :pd_enrollment,
      first_name: "EnrollFirst",
      last_name: "EnrollLast",
      email: "enroll@example.com",
      role: "other",
      user: user
    )

    serialized = ::Api::V1::Pd::WorkshopEnrollmentCsvSerializer.new(enrollment).attributes

    assert_equal "EnrollFirst", serialized[:first_name]
    assert_equal "EnrollLast", serialized[:last_name]
    # Email and role still prefer the user's valid values
    assert_equal user.email, serialized[:email]
    assert_equal user.educator_role, serialized[:role]
  end

  test 'attendances count' do
    workshop   = create(:workshop, num_sessions: 5)
    user       = create(:teacher, given_name: "Firstname", family_name: "Lastname")
    enrollment = create(:pd_enrollment, workshop: workshop, user: user)
    create(:pd_attendance, session: workshop.sessions.first, enrollment: enrollment)

    serialized = ::Api::V1::Pd::WorkshopEnrollmentCsvSerializer.new(workshop.enrollments.first).attributes
    assert_equal enrollment.attendances.count, serialized[:attendances]
  end
end
