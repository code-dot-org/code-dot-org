require 'test_helper'
class Pd::WorkshopEnrollmentControllerTest < ActionController::TestCase
  freeze_time

  self.use_transactional_test_case = true
  setup_all do
    @organizer = create :program_manager
    @workshop_organizer = create :workshop_organizer
    @facilitator = create :facilitator
    @teacher = create :teacher

    @school_district = create :school_district
    @school = create :school
  end

  setup do
    @workshop = create :byo_workshop, organizer: @organizer, num_sessions: 1
    @workshop.facilitators << @facilitator
    @existing_enrollment = create :pd_enrollment, workshop: @workshop

    @organizer_workshop = create :workshop, organizer: @workshop_organizer, num_sessions: 1
    @organizer_workshop.facilitators << @facilitator
    @organizer_workshop_existing_enrollment = create :pd_enrollment, workshop: @organizer_workshop
  end

  test 'join sends signed out users to sign in gate' do
    get :join, params: {workshop_id: @workshop.id}
    assert_redirected_to "/logged_out?source_page=workshop%20join&return_to=%2Fpd%2Fworkshops%2F#{@workshop.id}%2Fjoin"
  end

  test 'join sends student users to account upgrade gate' do
    student = create :student
    sign_in student

    get :join, params: {workshop_id: @workshop.id}
    assert_redirected_to "/teacher_account_required?source_page=workshop%20join&return_to=%2Fpd%2Fworkshops%2F#{@workshop.id}%2Fjoin"
  end

  test 'join has Not Found status with invalid workshop id' do
    sign_in @teacher

    get :join, params: {workshop_id: 'invalid-id'}
    assert_response :success
    assert_template :join
    assert_equal "not found", prop('workshop_enrollment_status')
  end

  test 'join has Closed status with closed workshop' do
    closed_workshop = create :workshop, :ended
    sign_in @teacher

    get :join, params: {workshop_id: closed_workshop.id}
    assert_response :success
    assert_template :join
    assert_equal "closed", prop('workshop_enrollment_status')
  end

  test 'join has Full status with full workshop' do
    full_workshop = create :workshop, capacity: 1, num_enrollments: 1
    sign_in @teacher

    get :join, params: {workshop_id: full_workshop.id}
    assert_response :success
    assert_template :join
    assert_equal "full", prop('workshop_enrollment_status')
  end

  test 'join has Own status if user tries to join their own workshop' do
    sign_in @workshop_organizer

    get :join, params: {workshop_id: @organizer_workshop.id}
    assert_response :success
    assert_template :join
    assert_equal "own", prop('workshop_enrollment_status')
  end

  test 'join has Duplicate status if user is already enrolled in the workshop' do
    already_enrolled_teacher = create :teacher
    workshop_with_enrollment = create :workshop
    create :pd_enrollment, workshop: workshop_with_enrollment, user: already_enrolled_teacher
    sign_in already_enrolled_teacher

    get :join, params: {workshop_id: workshop_with_enrollment.id}
    assert_response :success
    assert_template :join
    assert_equal "duplicate", prop('workshop_enrollment_status')
  end

  test 'join has Unsubmitted status if user is able to join the workshop' do
    sign_in @teacher

    get :join, params: {workshop_id: @workshop.id}
    assert_response :success
    assert_template :join
    assert_equal "unsubmitted", prop('workshop_enrollment_status')
  end

  test 'show route' do
    assert_routing(
      {path: "http://#{CDO.dashboard_hostname}/pd/workshop_enrollment/#{@existing_enrollment.code}", method: :get},
      {controller: 'pd/workshop_enrollment', action: 'show', code: @existing_enrollment.code}
    )
  end

  test 'show with a known code' do
    get :show, params: {code: @existing_enrollment.code}
    assert_response :success
  end

  test 'show with an unknown code responds with 404' do
    get :show, params: {code: 'not a valid code'}
    assert_response 404
  end

  test 'cancel route' do
    assert_routing(
      {path: "http://#{CDO.dashboard_hostname}/pd/workshop_enrollment/#{@existing_enrollment.code}/cancel", method: :get},
      {controller: 'pd/workshop_enrollment', action: 'cancel', code: @existing_enrollment.code}
    )
  end

  test 'cancel with a known code displays the cancel page' do
    get :cancel, params: {code: @existing_enrollment.code}
    assert_response :success
    assert_select 'h1', text: 'Cancel Registration'
  end

  test 'cancel with an unknown code or canceled displays the canceled page' do
    get :cancel, params: {code: 'not a valid code'}
    assert_response :success
    assert_select 'h1', text: 'Workshop Registration Canceled'
  end

  test 'cancel with attendance renders attended view and preserves the enrollment' do
    create :pd_attendance, enrollment: @existing_enrollment
    assert_does_not_destroy Pd::Enrollment do
      get :cancel, params: {code: @existing_enrollment.code}
    end
    assert_template :attended
  end

  test_redirect_to_sign_in_for :join_session, params: {session_code: 'XYZ'}
  test 'join session' do
    @workshop.start!
    sign_in @teacher
    get :join_session, params: {session_code: @workshop.sessions.first.code}
    assert_response :success
  end

  test_redirect_to_sign_in_for :confirm_join_session, method: :post, params: {session_code: 'XYZ'}
  test 'confirm_join_session' do
    @workshop.start!
    sign_in @teacher

    assert_creates Pd::Enrollment do
      post :confirm_join_session, params: {
        session_code: @workshop.sessions.first.code,
        pd_enrollment: enrollment_test_params(@teacher),
        school_info: school_info_params
      }
    end

    assert_redirected_to controller: 'pd/session_attendance', action: 'attend'
  end

  test 'confirm_join_session upgrades migrated student account if emails match' do
    @workshop.start!
    email = 'accidental_student@example.net'
    student = create :student, email: email
    student.migrate_to_multi_auth
    student.reload

    sign_in student

    assert_creates Pd::Enrollment do
      post :confirm_join_session, params: {
        session_code: @workshop.sessions.first.code,
        pd_enrollment: enrollment_test_params(student).merge(
          email: email,
          email_confirmation: email
        ),
        school_info: school_info_params
      }
    end

    student = User.find(student.id)
    assert student.teacher?
    assert_redirected_to controller: 'pd/session_attendance', action: 'attend'
  end

  test 'confirm_join_session upgrades unmigrated student account if emails match' do
    @workshop.start!
    email = 'accidental_student@example.net'
    student = create :student, email: email
    sign_in student

    assert_creates Pd::Enrollment do
      post :confirm_join_session, params: {
        session_code: @workshop.sessions.first.code,
        pd_enrollment: enrollment_test_params(student).merge(
          email: email,
          email_confirmation: email
        ),
        school_info: school_info_params
      }
    end

    student = User.find(student.id)
    assert student.teacher?
    assert_redirected_to controller: 'pd/session_attendance', action: 'attend'
  end

  test 'confirm_join_session redirects student to upgrade account if emails dont match' do
    @workshop.start!
    email = 'mismatch@example.net'
    student = create :student, email: 'accidental_student@example.net'
    sign_in student

    assert_creates Pd::Enrollment do
      post :confirm_join_session, params: {
        session_code: @workshop.sessions.first.code,
        pd_enrollment: enrollment_test_params(student).merge(
          email: email,
          email_confirmation: email
        ),
        school_info: school_info_params
      }
    end

    # Still a student
    assert student.reload.student?
    assert_redirected_to controller: 'pd/session_attendance', action: 'upgrade_account'
  end

  private def enrollment_test_params(teacher = nil)
    if teacher
      first_name, last_name = teacher.name.split(' ', 2)
      email = teacher.email
    else
      first_name = "Teacher#{SecureRandom.hex(4)}"
      last_name = 'Codeberg'
      email = "#{first_name}@example.net".downcase
    end
    {
      first_name: first_name,
      last_name: last_name,
      email: email,
      email_confirmation: email
    }
  end

  private def school_info_params
    {
      country: 'US',
      school_type: 'public',
      school_state: 'WA',
      school_district_id: @school_district.id,
      school_id: @school.id
    }
  end

  private def prop(name)
    JSON.parse(assigns(:script_data).try(:[], :props)).try(:[], name)
  end
end
