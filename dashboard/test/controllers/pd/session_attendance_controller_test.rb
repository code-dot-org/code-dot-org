require 'test_helper'
class Pd::SessionAttendanceControllerTest < ::ActionController::TestCase
  freeze_time

  self.use_transactional_test_case = true
  setup_all do
    @workshop = create :workshop, num_sessions: 1
    @workshop.start!
    @session = @workshop.sessions.first

    @teacher = create :teacher
  end

  setup do
  end

  test_redirect_to_sign_in_for :attend, params: -> {{session_code: @session.code}}

  test 'attend workshop I organized redirects with cant join message' do
    sign_in @workshop.organizer

    assert_does_not_create Pd::Attendance do
      get :attend, params: {session_code: @session.code}
    end
    assert_redirected_to CDO.studio_url('/', CDO.default_scheme)
    assert flash[:notice]
    assert flash[:notice].start_with? "You can't attend this workshop because you organized it."
  end

  test 'attend workshop I facilitated redirects with cant join message' do
    facilitator = create :facilitator
    @workshop.facilitators << facilitator
    sign_in facilitator

    assert_does_not_create Pd::Attendance do
      get :attend, params: {session_code: @session.code}
    end
    assert_redirected_to CDO.studio_url('/', CDO.default_scheme)
    assert flash[:notice]
    assert flash[:notice].start_with? "You can't attend this workshop because you organized it."
  end

  test 'attend too soon renders too_soon view' do
    sign_in @teacher
    Pd::Session.any_instance.expects(:too_soon_for_attendance?).returns(true)
    get :attend, params: {session_code: @session.code}
    assert_response :success
    assert_template :too_soon
  end

  test 'attend too late renders too_late view' do
    sign_in @teacher
    Pd::Session.any_instance.expects(:too_late_for_attendance?).returns(true)
    get :attend, params: {session_code: @session.code}
    assert_response :success
    assert_template :too_late
  end

  test 'attend no matching enrollment renders match_registration view' do
    sign_in @teacher
    get :attend, params: {session_code: @session.code}
    assert_response :success
    assert_template :match_registration
  end

  test 'attend with a matching enrollment creates attendance and redirects to home' do
    sign_in @teacher
    enrollment = create :pd_enrollment, :from_user, user: @teacher, workshop: @workshop

    assert_creates Pd::Attendance do
      get :attend, params: {session_code: @session.code}
    end
    attendance = Pd::Attendance.last
    assert_equal @teacher, attendance.teacher
    assert_equal enrollment, attendance.enrollment

    assert_template :attendance_recorded
  end

  test 'attend with a matching enrollment by email updates the enrollment.user' do
    enrollment = create :pd_enrollment, workshop: @workshop, user: nil, email: @teacher.email
    sign_in @teacher

    assert_creates Pd::Attendance do
      get :attend, params: {session_code: @session.code}
    end

    assert_equal @teacher, enrollment.reload.user
  end

  test_redirect_to_sign_in_for :select_enrollment, method: :post, params: -> {{session_code: @session.code}}

  test 'select_enrollment updates enrollment and creates attendance for selection' do
    sign_in @teacher
    enrollment = create :pd_enrollment, :from_user, user: @teacher, workshop: @workshop

    assert_creates Pd::Attendance do
      post :select_enrollment, params: {session_code: @session.code, enrollment_code: enrollment.code}
    end
    attendance = Pd::Attendance.last
    assert_equal @teacher, attendance.teacher
    assert_equal enrollment, attendance.enrollment

    assert_template :attendance_recorded
  end

  test 'select_enrollment assigns enrollment.user for the selected enrollment' do
    old_account = create :teacher
    enrollment = create :pd_enrollment, :from_user, user: old_account, workshop: @workshop
    sign_in @teacher

    assert_creates Pd::Attendance do
      post :select_enrollment, params: {session_code: @session.code, enrollment_code: enrollment.code}
    end

    assert_equal @teacher, enrollment.reload.user
  end

  test 'select_enrollment redirects to attend if the selection has already been taken' do
    sign_in @teacher
    enrollment = create :pd_enrollment, :from_user, user: @teacher, workshop: @workshop
    create :pd_attendance, session: @session, teacher: @teacher, enrollment: enrollment

    assert_does_not_create Pd::Attendance do
      post :select_enrollment, params: {session_code: @session.code, enrollment_code: enrollment.code}
    end

    assert_redirected_to action: :attend, session_code: @session.code
    assert flash[:error]
    assert flash[:error].end_with? 'has been claimed. Please look again.'
  end

  test 'select_enrollment automatically upgrades accidental student accounts if the emails match' do
    enrollment = create :pd_enrollment, :from_user, user: @teacher, workshop: @workshop
    @teacher.update!(user_type: User::TYPE_STUDENT)
    sign_in @teacher

    assert_creates Pd::Attendance do
      post :select_enrollment, params: {session_code: @session.code, enrollment_code: enrollment.code}
    end
    @teacher.reload
    assert @teacher.teacher?
    assert_template :attendance_recorded
  end

  test 'select_enrollment redirects to upgrade_account when accidental student account emails dont match' do
    student = create :student
    enrollment = create :pd_enrollment, user: student, workshop: @workshop
    sign_in student

    assert_creates Pd::Attendance do
      post :select_enrollment, params: {session_code: @session.code, enrollment_code: enrollment.code}
    end
    assert_redirected_to action: :upgrade_account
  end

  test_redirect_to_sign_in_for :upgrade_account, params: -> {{session_code: @session.code}}

  test 'upgrade_account succeeds for students' do
    student = create :student
    sign_in student

    get :upgrade_account, params: {session_code: @session.code}
    assert_response :success
  end

  test 'upgrade_account redirects to attend for teachers' do
    sign_in @teacher
    get :upgrade_account, params: {session_code: @session.code}
    assert_redirected_to action: :attend
  end

  test_redirect_to_sign_in_for :confirm_upgrade_account, method: :post, params: -> {{session_code: @session.code}}

  test 'confirm_upgrade_account upgrades the account if the emails match' do
    email = 'accidental_student@example.net'
    student = create :student, email: email
    sign_in student

    post :confirm_upgrade_account, params: {session_code: @session.code, email: email}
    assert student.reload.teacher?
    assert_redirected_to action: :attend
  end

  test 'confirm_upgrade_account renders upgrade_account if the emails dont match' do
    email = 'mismatch@example.net'
    student = create :student, email: 'accidental_student@example.net'
    sign_in student

    post :confirm_upgrade_account, params: {session_code: @session.code, email: email}
    assert_template :upgrade_account
  end

  test 'unrecognized session code renders custom not_found page' do
    sign_in @teacher
    get :attend, params: {session_code: 'nonexistent'}
    assert_response :not_found
    assert_template :not_found
    assert_select 'h1', 'Attendance Code Not Recognized'
  end
end
