require 'test_helper'

class Pd::AttendanceTest < ActiveSupport::TestCase
  freeze_time

  setup do
    @workshop = create :pd_workshop
    2.times {@workshop.sessions << create(:pd_session)}

    @teacher1 = create :teacher
    @teacher2 = create :teacher
    create :pd_attendance, session: @workshop.sessions[0], teacher: @teacher1
    create :pd_attendance, session: @workshop.sessions[0], teacher: @teacher2
    create :pd_attendance, session: @workshop.sessions[1], teacher: @teacher1

    @district = create :district
    create :districts_users, district: @district, user: @teacher1

    @another_workshop = create :pd_workshop
    @another_workshop.sessions << create(:pd_session)
    @unrelated_teacher = create :teacher
    create :pd_attendance, session: @another_workshop.sessions[0], teacher: @unrelated_teacher
    create :districts_users, district: @district, user: @unrelated_teacher
  end

  test 'for_teacher for_workshop' do
    teacher1_attendances = Pd::Attendance.for_teacher(@teacher1).for_workshop(@workshop)
    assert_equal 2, teacher1_attendances.count

    teacher2_attendances = Pd::Attendance.for_teacher(@teacher2).for_workshop(@workshop)
    assert_equal 1, teacher2_attendances.count
  end

  test 'distinct_teachers' do
    teachers = Pd::Attendance.distinct_teachers
    assert_equal 3, teachers.count
    assert_equal [@teacher1, @teacher2, @unrelated_teacher], teachers
  end

  test 'for workshop' do
    attendances = Pd::Attendance.for_workshop(@workshop)
    assert_equal 3, attendances.count
  end

  test 'distinct teachers for workshop' do
    teachers = Pd::Attendance.for_workshop(@workshop).distinct_teachers
    assert_equal 2, teachers.count
    assert_equal [@teacher1, @teacher2], teachers
  end

  test 'for_district' do
    attendances = Pd::Attendance.for_district(@district)
    assert_equal 3, attendances.count
  end

  test 'distinct teachers from district' do
    teachers = Pd::Attendance.for_district(@district).distinct_teachers
    assert_equal 2, teachers.count
    assert_equal [@teacher1, @unrelated_teacher], teachers
  end
end
