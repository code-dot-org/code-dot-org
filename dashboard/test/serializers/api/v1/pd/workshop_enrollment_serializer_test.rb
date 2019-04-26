require 'test_helper'

class Api::V1::Pd::WorkshopEnrollmentSerializerTest < ::ActionController::TestCase
  include Pd::Application::ActiveApplicationModels
  test 'serialized workshop enrollment has expected attributes' do
    enrollment = create :pd_enrollment
    expected_attributes = [
      :id, :first_name, :last_name, :email, :district_name, :school, :role,
      :grades_teaching, :attended_csf_intro_workshop, :csf_course_experience,
      :csf_courses_planned, :csf_has_physical_curriculum_guide, :user_id, :attended,
      :pre_workshop_survey, :previous_courses, :replace_existing, :attendances,
      :scholarship_status, :new_facilitator
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

  test 'new_facilitator' do
    summer_workshop = create :pd_workshop, :local_summer_workshop_upcoming
    enrollment = create :pd_enrollment, :from_user, workshop: summer_workshop

    serialized = ::Api::V1::Pd::WorkshopEnrollmentSerializer.new(summer_workshop.enrollments.first).attributes
    refute serialized[:new_facilitator]

    fac_app = create FACILITATOR_APPLICATION_FACTORY, user: enrollment.user
    fac_app.update(status: 'accepted')

    serialized = ::Api::V1::Pd::WorkshopEnrollmentSerializer.new(summer_workshop.enrollments.first).attributes
    assert serialized[:new_facilitator]
  end
end
