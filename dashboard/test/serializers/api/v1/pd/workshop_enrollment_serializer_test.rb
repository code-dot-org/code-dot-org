require 'test_helper'

class Api::V1::Pd::WorkshopEnrollmentSerializerTest < ::ActionController::TestCase
  test 'serialized workshop enrollment has expected attributes' do
    enrollment = create :pd_enrollment
    expected_attributes = [
      :id, :first_name, :last_name, :email, :district_name, :school, :role,
      :grades_teaching, :attended_csf_intro_workshop, :csf_course_experience,
      :csf_courses_planned, :csf_has_physical_curriculum_guide, :user_id, :attended,
      :pre_workshop_survey, :previous_courses, :replace_existing, :attendances,
      :scholarship_status
    ]

    serialized = ::Api::V1::Pd::WorkshopEnrollmentSerializer.new(enrollment).attributes
    assert_equal expected_attributes, serialized.keys
  end

  test 'attendances' do
    workshop = create :pd_workshop, num_sessions: 5
    enrollment = create :pd_enrollment, workshop: workshop
    create :pd_attendance, session: workshop.sessions.first, enrollment: enrollment

    serialized = ::Api::V1::Pd::WorkshopEnrollmentSerializer.new(workshop.enrollments.first).attributes
    assert_equal enrollment.attendances.count, serialized[:attendances]
  end
end
