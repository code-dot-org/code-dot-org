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
    @workshop = create :pd_workshop, organizer: @organizer, num_sessions: 1
    @workshop.facilitators << @facilitator
    @existing_enrollment = create :pd_enrollment, workshop: @workshop

    @organizer_workshop = create :pd_workshop, organizer: @workshop_organizer, num_sessions: 1
    @organizer_workshop.facilitators << @facilitator
    @organizer_workshop_existing_enrollment = create :pd_enrollment, workshop: @organizer_workshop
  end

  test 'enroll get route' do
    assert_routing(
      {path: "/pd/workshops/#{@workshop.id}/enroll", method: :get},
      {controller: 'pd/workshop_enrollment', action: 'new', workshop_id: @workshop.id.to_s}
    )
  end

  test 'non-logged-in users can enroll' do
    get :new, params: {workshop_id: @workshop.id}
    assert_response :success
    assert_template :new
    # Should see this message if not logged in
    assert_select 'span.info-box-message', text: 'Already have a Code.org account?'
  end

  test 'logged-in users can enroll' do
    sign_in @teacher
    get :new, params: {workshop_id: @workshop.id}
    assert_template :new
    # Should NOT see this message if logged in
    assert_select 'span.info-box-message', count: 0
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

  test 'new action for closed workshops renders closed view' do
    @workshop.start!
    @workshop.end!
    get :new, params: {workshop_id: @workshop.id}
    assert_template :closed
  end

  test 'new action for full workshops renders full view' do
    @workshop.capacity = 1
    @workshop.save!
    get :new, params: {workshop_id: @workshop.id}
    assert_template :full
  end

  test 'unknown workshop id responds with 404' do
    get :new, params: {workshop_id: 'nonsense'}
    assert_response 404
  end

  test 'enroll post route' do
    assert_routing(
      {path: "/pd/workshops/#{@workshop.id}/enroll", method: :post},
      {controller: 'pd/workshop_enrollment', action: 'create', workshop_id: @workshop.id.to_s}
    )
  end

  test 'enrollments can be created' do
    assert_creates(Pd::Enrollment) do
      post :create, params: {
        workshop_id: @workshop.id,
        pd_enrollment: enrollment_test_params,
        school_info: school_info_params
      }
    end
    enrollment = Pd::Enrollment.last
    refute_nil enrollment.code
    assert_redirected_to action: :thanks, code: enrollment.code
  end

  test 'creating a duplicate enrollment renders duplicate view' do
    params = enrollment_test_params.merge(
      {
        first_name: @existing_enrollment.first_name,
        last_name: @existing_enrollment.last_name,
        email: @existing_enrollment.email,
        confirmation_email: @existing_enrollment.email,
      }
    )
    post :create, params: {workshop_id: @workshop.id, pd_enrollment: params}
    assert_template :duplicate
  end

  # TODO: remove this test when workshop_organizer is deprecated
  test 'creating an enrollment with email match from organizer renders own view' do
    params = enrollment_test_params.merge(
      {
        full_name: @workshop_organizer.name,
        email: @workshop_organizer.email,
        confirmation_email: @workshop_organizer.email,
      }
    )
    post :create, params: {workshop_id: @organizer_workshop.id, pd_enrollment: params}
    assert_template :own
  end

  test 'creating an enrollment with email match from program manager organizer renders own view' do
    params = enrollment_test_params.merge(
      {
        full_name: @organizer.name,
        email: @organizer.email,
        confirmation_email: @organizer.email,
      }
    )
    post :create, params: {workshop_id: @workshop.id, pd_enrollment: params}
    assert_template :own
  end

  test 'creating an enrollment with email match from facilitator renders own view' do
    params = enrollment_test_params.merge(
      {
        full_name: @facilitator.name,
        email: @facilitator.email,
        confirmation_email: @facilitator.email,
      }
    )
    post :create, params: {workshop_id: @workshop.id, pd_enrollment: params}
    assert_template :own
  end

  test 'creating an enrollment on a closed workshop renders new view' do
    @workshop.start!
    @workshop.end!
    post :create, params: {
      workshop_id: @workshop.id,
      pd_enrollment: enrollment_test_params
    }
    assert_template :closed
  end

  test 'creating an enrollment on a full workshop renders full view' do
    @workshop.capacity = 1
    @workshop.save!
    post :create, params: {
      workshop_id: @workshop.id,
      pd_enrollment: enrollment_test_params
    }
    assert_template :full
  end

  test 'creating an enrollment with errors renders new view' do
    params = enrollment_test_params.merge(
      {
        first_name: '',
        confirmation_email: nil
      }
    )
    post :create, params: {
      workshop_id: @workshop.id,
      pd_enrollment: params,
      school_info: school_info_params
    }
    assert_template :new
  end

  test 'creating an enrollment on an unknown workshop id returns 404' do
    post :create, params: {
      workshop_id: 'nonsense',
      pd_enrollment: enrollment_test_params
    }
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

  test 'confirm_join_session upgrades student account if emails match' do
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
end
