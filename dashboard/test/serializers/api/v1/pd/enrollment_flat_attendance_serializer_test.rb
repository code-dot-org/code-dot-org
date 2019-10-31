require 'test_helper'

class Api::V1::Pd::EnrollmentFlatAttendanceSerializerTest < ::ActionController::TestCase
  freeze_time

  setup do
    @workshop = create :workshop, num_sessions: 2
    @workshop.start!
  end

  test 'format no attendance' do
    teacher = create :pd_workshop_participant, workshop: @workshop, enrolled: true

    serialized = ::Api::V1::Pd::EnrollmentFlatAttendanceSerializer.new(Pd::Enrollment.last).attributes
    first_name, last_name = teacher.name.split(' ', 2)
    expected = {
      first_name: first_name,
      last_name: last_name,
      email: teacher.email,
      session_1_date: @workshop.sessions[0].formatted_date,
      session_1_attendance: false,
      session_2_date: @workshop.sessions[1].formatted_date,
      session_2_attendance: false,
      cdo_scholarship: 'Yes',
      other_scholarship: ''
    }
    assert_equal expected, serialized
  end

  test 'format partial attendance' do
    teacher = create :pd_workshop_participant, workshop: @workshop, enrolled: true,
      attended: [@workshop.sessions[0]]

    serialized = ::Api::V1::Pd::EnrollmentFlatAttendanceSerializer.new(Pd::Enrollment.last).attributes
    first_name, last_name = teacher.name.split(' ', 2)
    expected = {
      first_name: first_name,
      last_name: last_name,
      email: teacher.email,
      session_1_date: @workshop.sessions[0].formatted_date,
      session_1_attendance: true,
      session_2_date: @workshop.sessions[1].formatted_date,
      session_2_attendance: false,
      cdo_scholarship: 'Yes',
      other_scholarship: ''
    }
    assert_equal expected, serialized
  end

  test 'format full attendance' do
    teacher = create :pd_workshop_participant, workshop: @workshop, enrolled: true, attended: true

    serialized = ::Api::V1::Pd::EnrollmentFlatAttendanceSerializer.new(Pd::Enrollment.last).attributes
    first_name, last_name = teacher.name.split(' ', 2)
    expected = {
      first_name: first_name,
      last_name: last_name,
      email: teacher.email,
      session_1_date: @workshop.sessions[0].formatted_date,
      session_1_attendance: true,
      session_2_date: @workshop.sessions[1].formatted_date,
      session_2_attendance: true,
      cdo_scholarship: 'Yes',
      other_scholarship: ''
    }
    assert_equal expected, serialized
  end

  test 'handle_no_user' do
    rogue_enrollment = create :pd_enrollment, workshop: @workshop

    serialized = ::Api::V1::Pd::EnrollmentFlatAttendanceSerializer.new(Pd::Enrollment.last).attributes
    expected = {
      first_name: rogue_enrollment.first_name,
      last_name: rogue_enrollment.last_name,
      email: rogue_enrollment.email,
      session_1_date: @workshop.sessions[0].formatted_date,
      session_1_attendance: false,
      session_2_date: @workshop.sessions[1].formatted_date,
      session_2_attendance: false,
      cdo_scholarship: '',
      other_scholarship: ''
    }
    assert_equal expected, serialized
  end

  test 'deleted user that attended shows as attended' do
    teacher = create :pd_workshop_participant, workshop: @workshop, enrolled: true, attended: true
    teacher.destroy!

    serialized = ::Api::V1::Pd::EnrollmentFlatAttendanceSerializer.new(Pd::Enrollment.last).attributes
    first_name, last_name = teacher.name.split(' ', 2)
    expected = {
      first_name: first_name,
      last_name: last_name,
      email: teacher.email,
      session_1_date: @workshop.sessions[0].formatted_date,
      session_1_attendance: true,
      session_2_date: @workshop.sessions[1].formatted_date,
      session_2_attendance: true,
      cdo_scholarship: '',
      other_scholarship: ''
    }
    assert_equal expected, serialized
  end

  test 'deleted user that did not attend shows as not attended' do
    teacher = create :pd_workshop_participant, workshop: @workshop, enrolled: true, attended: false
    teacher.destroy!

    serialized = ::Api::V1::Pd::EnrollmentFlatAttendanceSerializer.new(Pd::Enrollment.last).attributes
    first_name, last_name = teacher.name.split(' ', 2)
    expected = {
      first_name: first_name,
      last_name: last_name,
      email: teacher.email,
      session_1_date: @workshop.sessions[0].formatted_date,
      session_1_attendance: false,
      session_2_date: @workshop.sessions[1].formatted_date,
      session_2_attendance: false,
      cdo_scholarship: '',
      other_scholarship: ''
    }
    assert_equal expected, serialized
  end

  test 'cdo scholarship column' do
    workshop = create :workshop, num_sessions: 1, sessions_from: Date.current + 3.months, course: Pd::SharedWorkshopConstants::COURSE_CSF
    enrollment = create :pd_enrollment, :from_user, workshop: workshop
    enrollment.update_scholarship_status(Pd::ScholarshipInfoConstants::YES_CDO)
    assert_equal Pd::ScholarshipInfoConstants::YES_CDO, enrollment.scholarship_status

    serialized = ::Api::V1::Pd::EnrollmentFlatAttendanceSerializer.new(Pd::Enrollment.last).attributes
    first_name, last_name = enrollment.user.name.split(' ', 2)
    expected = {
      first_name: first_name,
      last_name: last_name,
      email: enrollment.email,
      session_1_date: workshop.sessions[0].formatted_date,
      session_1_attendance: false,
      cdo_scholarship: 'Yes',
      other_scholarship: ''
    }
    assert_equal expected, serialized
  end

  test 'other scholarship column' do
    workshop = create :workshop, num_sessions: 1, sessions_from: Date.current + 3.months, course: Pd::SharedWorkshopConstants::COURSE_CSF
    enrollment = create :pd_enrollment, :from_user, workshop: workshop
    enrollment.update_scholarship_status(Pd::ScholarshipInfoConstants::YES_OTHER)
    assert_equal Pd::ScholarshipInfoConstants::YES_OTHER, enrollment.scholarship_status

    serialized = ::Api::V1::Pd::EnrollmentFlatAttendanceSerializer.new(Pd::Enrollment.last).attributes
    first_name, last_name = enrollment.user.name.split(' ', 2)
    expected = {
      first_name: first_name,
      last_name: last_name,
      email: enrollment.email,
      session_1_date: workshop.sessions[0].formatted_date,
      session_1_attendance: false,
      cdo_scholarship: '',
      other_scholarship: 'Yes'
    }
    assert_equal expected, serialized
  end
end
