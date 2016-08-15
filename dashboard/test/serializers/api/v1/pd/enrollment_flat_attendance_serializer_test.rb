require 'test_helper'

class Api::V1::Pd::EnrollmentFlatAttendanceSerializerTest < ::ActionController::TestCase
  freeze_time

  setup do
    @workshop = create :pd_workshop, num_sessions: 2
    @workshop.start!
  end

  test 'format no attendance' do
    teacher = create :pd_workshop_participant, workshop: @workshop, enrolled: true

    serialized = ::Api::V1::Pd::EnrollmentFlatAttendanceSerializer.new(Pd::Enrollment.last).attributes
    expected = {
      name: teacher.name,
      email: teacher.email,
      in_section?: false,
      session_1_date: @workshop.sessions[0].formatted_date,
      session_1_attendance: false,
      session_2_date: @workshop.sessions[1].formatted_date,
      session_2_attendance: false
    }
    assert_equal expected, serialized
  end

  test 'format partial attendance' do
    teacher = create :pd_workshop_participant, workshop: @workshop, enrolled: true,
      in_section: true, attended: [@workshop.sessions[0]]

    serialized = ::Api::V1::Pd::EnrollmentFlatAttendanceSerializer.new(Pd::Enrollment.last).attributes
    expected = {
      name: teacher.name,
      email: teacher.email,
      in_section?: true,
      session_1_date: @workshop.sessions[0].formatted_date,
      session_1_attendance: true,
      session_2_date: @workshop.sessions[1].formatted_date,
      session_2_attendance: false
    }
    assert_equal expected, serialized
  end

  test 'format full attendance' do
    teacher = create :pd_workshop_participant, workshop: @workshop, enrolled: true,
      in_section: true, attended: true

    serialized = ::Api::V1::Pd::EnrollmentFlatAttendanceSerializer.new(Pd::Enrollment.last).attributes
    expected = {
      name: teacher.name,
      email: teacher.email,
      in_section?: true,
      session_1_date: @workshop.sessions[0].formatted_date,
      session_1_attendance: true,
      session_2_date: @workshop.sessions[1].formatted_date,
      session_2_attendance: true
    }
    assert_equal expected, serialized
  end

  test 'handle_no_user' do
    rogue_enrollment = create :pd_enrollment, workshop: @workshop

    serialized = ::Api::V1::Pd::EnrollmentFlatAttendanceSerializer.new(Pd::Enrollment.last).attributes
    expected = {
      name: rogue_enrollment.name,
      email: rogue_enrollment.email,
      in_section?: false,
      session_1_date: @workshop.sessions[0].formatted_date,
      session_1_attendance: false,
      session_2_date: @workshop.sessions[1].formatted_date,
      session_2_attendance: false
    }
    assert_equal expected, serialized
  end
end
