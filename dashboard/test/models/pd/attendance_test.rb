require 'test_helper'

class Pd::AttendanceTest < ActiveSupport::TestCase
  freeze_time

  self.use_transactional_test_case = true
  setup_all do
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

  test 'unique constraint on pd_session_id and teacher_id prevents duplicates' do
    attendance = create :pd_attendance
    dupe = attendance.dup

    assert_raises ActiveRecord::RecordNotUnique do
      dupe.save!
    end
  end

  test 'soft delete' do
    attendance = create :pd_attendance
    attendance.reload.destroy!

    assert attendance.reload.deleted?
    refute Pd::Attendance.exists? attendance.attributes
    assert Pd::Attendance.with_deleted.exists? attendance.attributes
  end

  test 'teacher or enrollment must be present' do
    attendance = build :pd_attendance, teacher: nil, enrollment: nil
    refute attendance.valid?
    assert_equal ['Teacher or enrollment must be present.'], attendance.errors.full_messages

    attendance.teacher = create :teacher
    assert attendance.valid?

    attendance.teacher = nil
    attendance.enrollment = create :pd_enrollment
    assert attendance.valid?
  end

  test 'enrollment is populated on save' do
    teacher = create :teacher
    enrollment = create :pd_enrollment, workshop: @workshop, user_id: teacher.id
    attendance = build :pd_attendance, teacher: teacher, workshop: @workshop, session: @workshop.sessions.first

    assert_nil attendance.enrollment
    assert attendance.save
    assert_not_nil attendance.reload.enrollment
    assert_equal enrollment.id, attendance.enrollment.id
  end

  test 'resolve_enrollment' do
    teacher = create :teacher
    enrollment = create :pd_enrollment, workshop: @workshop, user_id: teacher.id, email: teacher.email
    attendance = build :pd_attendance, teacher: teacher, workshop: @workshop, session: @workshop.sessions.first

    # by user id
    assert_equal enrollment, attendance.resolve_enrollment

    # by email
    enrollment.update!(user_id: nil)
    assert_equal enrollment, attendance.resolve_enrollment

    # by email with deleted user
    teacher.destroy!
    assert_equal enrollment, attendance.resolve_enrollment

    # no match
    enrollment.destroy!
    assert_nil attendance.resolve_enrollment
  end
end
