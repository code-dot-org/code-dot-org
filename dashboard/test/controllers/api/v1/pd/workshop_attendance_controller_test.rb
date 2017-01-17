require 'test_helper'

class Api::V1::Pd::WorkshopAttendanceControllerTest < ::ActionDispatch::IntegrationTest
  freeze_time

  setup do
    @organizer = create :workshop_organizer
    @facilitator = create :facilitator

    @workshop = create :pd_workshop, organizer: @organizer, facilitators: [@facilitator], num_sessions: 1
    @workshop.start!

    @teacher = create :teacher, sign_in_count: 1
    @workshop.section.add_student @teacher
    @session = @workshop.sessions.first

    @other_workshop = create :pd_workshop, num_sessions: 1
    @other_workshop.start!

    @other_teacher = create :teacher, sign_in_count: 1
    @other_workshop.section.add_student @other_teacher
  end

  API = '/api/v1/pd/workshops'

  def get_workshop_attendance(workshop)
    get "#{API}/#{workshop.id}/attendance"
  end

  def get_session_attendance(workshop, session)
    get "#{API}/#{workshop.id}/attendance/#{session.id}"
  end

  def create_attendance(workshop, session, user, admin_override: nil)
    params = admin_override ? {admin_override: admin_override} : {}
    put "#{API}/#{workshop.id}/attendance/#{session.id}/user/#{user.id}", params: params
  end

  def create_attendance_by_enrollment(workshop, session, enrollment)
    put "#{API}/#{workshop.id}/attendance/#{session.id}/enrollment/#{enrollment.id}"
  end

  def delete_attendance(workshop, session, user)
    delete "#{API}/#{workshop.id}/attendance/#{session.id}/user/#{user.id}"
  end

  def delete_attendance_by_enrollment(workshop, session, enrollment)
    delete "#{API}/#{workshop.id}/attendance/#{session.id}/enrollment/#{enrollment.id}"
  end

  test 'facilitators can manage attendance for their workshops only' do
    sign_in @facilitator
    assert_read_response :success
    assert_manage_response :success

    assert_read_response :forbidden, workshop: @other_workshop
    assert_manage_response :forbidden, workshop: @other_workshop, user: @other_teacher
  end

  test 'workshop organizers can manage attendance for their workshops only' do
    sign_in @organizer
    assert_read_response :success
    assert_manage_response :success

    assert_read_response :forbidden, workshop: @other_workshop
    assert_manage_response :forbidden, workshop: @other_workshop, user: @other_teacher
  end

  test 'admins can manage attendance for all workshops' do
    sign_in create(:admin)
    assert_read_response :success, workshop: @workshop
    assert_manage_response :success, workshop: @workshop, user: @teacher

    assert_read_response :success, workshop: @other_workshop
    assert_manage_response :success, workshop: @other_workshop, user: @other_teacher
  end

  test 'facilitators can read, but cannot manage, attendance for ended workshops' do
    @workshop.end!
    sign_in @facilitator

    assert_read_response :success
    assert_manage_response :forbidden
  end

  test 'organizers can read, but cannot manage, attendance for ended workshops' do
    @workshop.end!
    sign_in @organizer

    assert_read_response :success
    assert_manage_response :forbidden
  end

  test 'admins can manage attendance for ended workshops' do
    @workshop.end!
    sign_in create(:admin)

    assert_read_response :success
    assert_manage_response :success
  end

  test 'teachers cannot read attendance' do
    sign_in @teacher
    assert_read_response :forbidden
    assert_manage_response :forbidden
  end

  test 'show format' do
    3.times do
      create :pd_enrollment, workshop: @workshop
    end

    sign_in @organizer
    get_session_attendance @workshop, @session
    response = JSON.parse(@response.body)

    session = response['session']
    assert session
    assert_equal @session.id, session['id']

    attendance = response['attendance']
    assert attendance
    assert_equal 3, attendance.count
  end

  test 'show enrollment with no user' do
    enrollment = create :pd_enrollment, workshop: @workshop

    sign_in @organizer
    attendance = get_session_single_attendance_json @workshop, @session

    assert enrollment.email, attendance['email']
    assert enrollment.first_name, attendance['first_name']
    assert enrollment.last_name, attendance['last_name']
    assert_nil attendance['user_id']
    refute attendance['in_section']
    refute attendance['attended']
  end

  test 'show enrollment with user' do
    teacher_enrolled = create :pd_workshop_participant, workshop: @workshop,
      enrolled: true, in_section: false, attended: false, sign_in_count: 1
    enrollment = Pd::Enrollment.last

    sign_in @organizer
    attendance = get_session_single_attendance_json @workshop, @session

    assert teacher_enrolled.email, attendance['email']
    assert enrollment.first_name, attendance['first_name']
    assert enrollment.last_name, attendance['last_name']
    assert_equal teacher_enrolled.id, attendance['user_id']
    refute attendance['in_section']
    refute attendance['attended']
  end

  test 'show enrollment in section' do
    # @teacher is already in the section. Just create an enrollment
    enrollment = create :pd_enrollment, workshop: @workshop,
      full_name: @teacher.name, email: @teacher.email

    sign_in @organizer
    attendance = get_session_single_attendance_json @workshop, @session

    assert @teacher.email, attendance['email']
    assert enrollment.first_name, attendance['first_name']
    assert enrollment.last_name, attendance['last_name']
    assert_equal @teacher.id, attendance['user_id']
    assert attendance['in_section']
    refute attendance['attended']
  end

  test 'show enrollment attended' do
    teacher = create :pd_workshop_participant, workshop: @workshop,
      enrolled: true, in_section: true, attended: true, sign_in_count: 1
    enrollment = Pd::Enrollment.last

    sign_in @organizer
    attendance = get_session_single_attendance_json @workshop, @session

    assert teacher.email, attendance['email']
    assert enrollment.first_name, attendance['first_name']
    assert enrollment.last_name, attendance['last_name']
    assert_equal teacher.id, attendance['user_id']
    assert attendance['in_section']
    assert attendance['attended']
  end

  test 'create attendance' do
    sign_in @organizer
    teacher = create :teacher
    @workshop.section.add_student teacher

    # set_attendance is idempotent
    assert_creates Pd::Attendance do
      2.times do
        create_attendance @workshop, @session, teacher
        assert_response :success
      end
    end
    assert_equal teacher.id, Pd::Attendance.last.teacher_id
    assert_equal @session.id, Pd::Attendance.last.pd_session_id
  end

  test 'create attendance renders 404 when teacher is not in the section' do
    # even for admins
    sign_in create(:admin)
    teacher = create :teacher

    create_attendance @workshop, @session, teacher
    assert_response :not_found
  end

  test 'create attendance renders 404 when teacher does not exist' do
    sign_in @organizer

    create_attendance @workshop, @session, build(:user, id: -1)
    assert_response :not_found
  end

  test 'create attendance allows admins to override and add teachers to the section' do
    sign_in create(:admin)
    teacher = create :teacher

    # set_attendance is idempotent
    assert_creates Pd::Attendance, Follower do
      2.times do
        create_attendance @workshop, @session, teacher, admin_override: 1
        assert_response :success
      end
    end
    assert_equal teacher.id, Pd::Attendance.last.teacher_id
    assert_equal @session.id, Pd::Attendance.last.pd_session_id
    assert_equal teacher.id, Follower.last.student_user_id
  end

  test 'create attendance returns 404 even with admin_override when the teacher does not exist' do
    sign_in create(:admin)

    create_attendance @workshop, @session, build(:user, id: -1), admin_override: 1
    assert_response :not_found
  end

  test 'delete_attendance' do
    sign_in @organizer
    teacher = create :teacher
    @workshop.section.add_student teacher
    create :pd_attendance, session: @session, teacher: teacher

    # delete_attendance is idempotent
    2.times do
      delete_attendance @workshop, @session, teacher
      assert_response :success
    end

    refute Pd::Attendance.where(session: @session, teacher: teacher).exists?
  end

  test 'create delete and create restores the original record' do
    sign_in @organizer
    teacher = create :teacher
    @workshop.section.add_student teacher

    create_attendance @workshop, @session, teacher
    assert_response :success
    attendance = Pd::Attendance.last

    delete_attendance @workshop, @session, teacher
    assert_response :success
    assert attendance.reload.persisted?
    assert attendance.deleted?

    create_attendance @workshop, @session, teacher
    assert_response :success
    refute attendance.reload.deleted?
  end

  test 'create attendance by enrollment fails when an account is required' do
    sign_in @organizer
    enrollment = create :pd_enrollment, workshop: @workshop

    assert @workshop.account_required_for_attendance?
    create_attendance_by_enrollment @workshop, @session, enrollment
    assert_response :not_found
  end

  test 'create attendance by enrollment succeeds when an account is not required' do
    # Admin courses do not require attendance
    @workshop.update!(course: Pd::Workshop::COURSE_ADMIN)

    sign_in @organizer
    enrollment = create :pd_enrollment, workshop: @workshop

    refute @workshop.account_required_for_attendance?
    assert_creates Pd::Attendance do
      # create_attendance_by_enrollment is idempotent
      2.times do
        create_attendance_by_enrollment @workshop, @session, enrollment
        assert_response :success
      end
    end
  end

  test 'delete attendance by enrollment succeeds' do
    sign_in @organizer
    enrollment = create :pd_enrollment, workshop: @workshop
    create :pd_attendance, session: @session, enrollment: enrollment

    # delete_attendance_by_enrollment is idempotent
    2.times do
      delete_attendance_by_enrollment @workshop, @session, enrollment
      assert_response :success
    end

    refute Pd::Attendance.where(session: @session, enrollment: enrollment).exists?
  end

  private

  def assert_manage_response(response, workshop: @workshop, session: nil, user: @teacher)
    session ||= workshop.sessions.first

    create_attendance workshop, session, user
    assert_response response

    delete_attendance workshop, session, user
    assert_response response
  end

  def assert_read_response(response, workshop: @workshop, session: nil)
    session ||= workshop.sessions.first

    get_workshop_attendance workshop
    assert_response response

    get_session_attendance workshop, session
    assert_response response
  end

  def get_session_single_attendance_json(workshop, session)
    get_session_attendance workshop, session
    response = JSON.parse(@response.body)
    attendance = response['attendance']
    assert attendance
    assert_equal 1, attendance.length
    attendance.first
  end

  def params(attended = true)
    attendances = attended ? [{id: @teacher.id}] : []
    {
      session_attendances: [
        session_id: @session.id,
        attendances: attendances
      ]
    }
  end

  def create_user_params(enrolled_teacher_email)
    {
      session_attendances: [
        session_id: @session.id,
        attendances: [{email: enrolled_teacher_email}]
      ]
    }
  end
end
