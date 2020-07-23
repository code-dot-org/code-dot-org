require 'test_helper'
class Pd::WorkshopEnrollmentControllerTest < ::ActionController::TestCase
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
    @workshop = create :workshop, organizer: @organizer, num_sessions: 1
    @workshop.facilitators << @facilitator
    @existing_enrollment = create :pd_enrollment, workshop: @workshop

    @organizer_workshop = create :workshop, organizer: @workshop_organizer, num_sessions: 1
    @organizer_workshop.facilitators << @facilitator
    @organizer_workshop_existing_enrollment = create :pd_enrollment, workshop: @organizer_workshop
  end

  test 'enroll get route' do
    assert_routing(
      {path: "/pd/workshops/#{@workshop.id}/enroll", method: :get},
      {controller: 'pd/workshop_enrollment', action: 'new', workshop_id: @workshop.id.to_s}
    )
  end

  test 'non-logged-in users cannot enroll in csf workshop' do
    workshop = create :workshop, course: Pd::Workshop::COURSE_CSF
    get :new, params: {workshop_id: workshop.id}
    assert_response :success
    assert_template :logged_out
  end

  test 'non-logged-in users cannot enroll in csd workshop' do
    workshop = create :workshop, course: Pd::Workshop::COURSE_CSD
    get :new, params: {workshop_id: workshop.id}
    assert_response :success
    assert_template :logged_out
  end

  test 'non-logged-in users cannot enroll in csp workshop' do
    workshop = create :workshop, course: Pd::Workshop::COURSE_CSP
    get :new, params: {workshop_id: workshop.id}
    assert_response :success
    assert_template :logged_out
  end

  test 'logged-in users can enroll in csf workshop' do
    sign_in @teacher
    workshop = create :workshop, course: Pd::Workshop::COURSE_CSF
    get :new, params: {workshop_id: workshop.id}
    assert_response :success
    assert_template :new
  end

  test 'logged-in users can enroll in csd workshop' do
    sign_in @teacher
    workshop = create :workshop, course: Pd::Workshop::COURSE_CSD
    get :new, params: {workshop_id: workshop.id}
    assert_response :success
    assert_template :new
  end

  test 'logged-in users can enroll in csp workshop' do
    sign_in @teacher
    workshop = create :workshop, course: Pd::Workshop::COURSE_CSP
    get :new, params: {workshop_id: workshop.id}
    assert_response :success
    assert_template :new
  end

  # TODO: remove this test when workshop_organizer is deprecated
  test 'workshop organizers can see enrollment form' do
    # Note - organizers can see the form, but cannot enroll in their own workshops.
    # This is tested in 'creating an enrollment with email match from organizer renders own view'
    sign_in @workshop_organizer
    get :new, params: {workshop_id: @organizer_workshop.id}
    assert_template :new
  end

  test 'program manager workshop organizers can see enrollment form' do
    # Note - organizers can see the form, but cannot enroll in their own workshops.
    # This is tested in 'creating an enrollment with email match from organizer renders own view'
    sign_in @organizer
    get :new, params: {workshop_id: @workshop.id}
    assert_template :new
  end

  test 'facilitators can see enrollment form' do
    # Note - facilitators can see the form, but cannot enroll in their own workshops.
    # This is tested in 'creating an enrollment with email match from facilitator renders own view'
    sign_in @facilitator
    get :new, params: {workshop_id: @workshop.id}
    assert_template :new
  end

  test 'unrelated organizers and facilitators can enroll' do
    unrelated_super_user = @teacher
    unrelated_super_user.permission = UserPermission::WORKSHOP_ORGANIZER
    unrelated_super_user.permission = UserPermission::FACILITATOR

    sign_in unrelated_super_user
    get :new, params: {workshop_id: @workshop.id}
    assert_template :new
  end

  test 'unknown workshop id responds with 404' do
    get :new, params: {workshop_id: 'nonsense'}
    assert_response 404
  end

  test 'show route' do
    assert_routing(
      {path: "/pd/workshop_enrollment/#{@existing_enrollment.code}", method: :get},
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
      {path: "/pd/workshop_enrollment/#{@existing_enrollment.code}/cancel", method: :get},
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

    assert student.reload.teacher?
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

    assert student.reload.teacher?
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

  test 'demographic questions added (for teachers, without application, for local summer workshop)' do
    sign_in @teacher
    workshop = create :summer_workshop

    get :new, params: {workshop_id: workshop.id}
    assert_template :new
    assert prop('collect_demographics')
  end

  test 'demographic questions not added (for teachers, with application, for local summer workshop)' do
    sign_in @teacher
    workshop = create :workshop
    create Pd::Application::ActiveApplicationModels::TEACHER_APPLICATION_FACTORY, user: @teacher

    get :new, params: {workshop_id: workshop.id}
    assert_template :new
    refute prop('collect_demographics')
  end

  test 'demographic questions not added (for teachers, without application, for non-local summer workshop)' do
    sign_in @teacher
    workshop = create :workshop

    get :new, params: {workshop_id: workshop.id}
    assert_template :new
    refute prop('collect_demographics')
  end

  private

  def enrollment_test_params(teacher = nil)
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

  def school_info_params
    {
      country: 'US',
      school_type: 'public',
      school_state: 'WA',
      school_district_id: @school_district.id,
      school_id: @school.id
    }
  end

  def prop(name)
    JSON.parse(assigns(:script_data).try(:[], :props)).try(:[], name)
  end
end
