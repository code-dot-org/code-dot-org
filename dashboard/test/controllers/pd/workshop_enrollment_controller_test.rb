require 'test_helper'
class Pd::WorkshopEnrollmentControllerTest < ::ActionController::TestCase
  freeze_time

  setup do
    @organizer = create :workshop_organizer
    @workshop = create :pd_workshop, organizer: @organizer
    @workshop.sessions << create(:pd_session)
    @facilitator = create :facilitator
    @workshop.facilitators << @facilitator

    @existing_enrollment = create :pd_enrollment, workshop: @workshop
  end

  test 'enroll get route' do
    assert_routing(
      {path: "/pd/workshops/#{@workshop.id}/enroll", method: :get},
      {controller: 'pd/workshop_enrollment', action: 'new', workshop_id: @workshop.id.to_s}
    )
  end

  test 'non-logged-in users can enroll' do
    get :new, workshop_id: @workshop.id
    assert_response :success
    assert_template :new
  end

  test 'logged-in users can enroll' do
    sign_in create :teacher
    get :new, workshop_id: @workshop.id
    assert_template :new
  end

  test 'workshop organizers can see enrollment form' do
    # Note - organizers can see the form, but cannot enroll in their own workshops.
    # This is tested in 'creating an enrollment with email match from organizer renders own view'
    sign_in @organizer
    get :new, workshop_id: @workshop.id
    assert_template :new
  end

  test 'facilitators can see enrollment form' do
    # Note - facilitators can see the form, but cannot enroll in their own workshops.
    # This is tested in 'creating an enrollment with email match from facilitator renders own view'
    sign_in @facilitator
    get :new, workshop_id: @workshop.id
    assert_template :new
  end

  test 'unrelated organizers and facilitators can enroll' do
    unrelated_super_user = create :teacher
    unrelated_super_user.permission = UserPermission::WORKSHOP_ORGANIZER
    unrelated_super_user.permission = UserPermission::FACILITATOR

    sign_in unrelated_super_user
    get :new, workshop_id: @workshop.id
    assert_template :new
  end

  test 'new action for closed workshops renders closed view' do
    @workshop.start!
    @workshop.end!
    get :new, workshop_id: @workshop.id
    assert_template :closed
  end

  test 'new action for full workshops renders full view' do
    @workshop.capacity = 1
    @workshop.save!
    get :new, workshop_id: @workshop.id
    assert_template :full
  end

  test 'unknown workshop id responds with 404' do
    get :new, workshop_id: 'nonsense'
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
      post :create, workshop_id: @workshop.id, pd_enrollment: enrollment_test_params
    end
    enrollment = Pd::Enrollment.last
    refute_nil enrollment.code
    assert_redirected_to action: :show, code: enrollment.code
  end

  test 'creating a duplicate enrollment renders duplicate view' do
    params = enrollment_test_params.merge({
      name: @existing_enrollment.name,
      email: @existing_enrollment.email,
      confirmation_email: @existing_enrollment.email,
    })
    post :create, workshop_id: @workshop.id, pd_enrollment: params
    assert_template :duplicate
  end

  test 'creating an enrollment with email match from organizer renders own view' do
    params = enrollment_test_params.merge({
      name: @organizer.name,
      email: @organizer.email,
      confirmation_email: @organizer.email,
    })
    post :create, workshop_id: @workshop.id, pd_enrollment: params
    assert_template :own
  end

  test 'creating an enrollment with email match from facilitator renders own view' do
    params = enrollment_test_params.merge({
      name: @facilitator.name,
      email: @facilitator.email,
      confirmation_email: @facilitator.email,
    })
    post :create, workshop_id: @workshop.id, pd_enrollment: params
    assert_template :own
  end

  test 'creating an enrollment on a closed workshop renders new view' do
    @workshop.start!
    @workshop.end!
    post :create, workshop_id: @workshop.id, pd_enrollment: enrollment_test_params
    assert_template :closed
  end

  test 'creating an enrollment on a full workshop renders full view' do
    @workshop.capacity = 1
    @workshop.save!
    post :create, workshop_id: @workshop.id, pd_enrollment: enrollment_test_params
    assert_template :full
  end

  test 'creating an enrollment with errors renders new view' do
    params = enrollment_test_params.merge({
      name: '',
      confirmation_email: nil
    })
    post :create, workshop_id: @workshop.id, pd_enrollment: params
    assert_template :new
  end

  test 'creating an enrollment on an unknown workshop id returns 404' do
    post :create, workshop_id: 'nonsense', pd_enrollment: enrollment_test_params
    assert_response 404
  end

  test 'show route' do
    assert_routing(
      {path: "/pd/workshop_enrollment/#{@existing_enrollment.code}", method: :get},
      {controller: 'pd/workshop_enrollment', action: 'show', code: @existing_enrollment.code}
    )
  end

  test 'show with a known code' do
    get :show, code: @existing_enrollment.code
    assert_response :success
  end

  test 'show with an unknown code responds with 404' do
    get :show, code: 'not a valid code'
    assert_response 404
  end

  test 'cancel route' do
    assert_routing(
      {path: "/pd/workshop_enrollment/#{@existing_enrollment.code}/cancel", method: :get},
      {controller: 'pd/workshop_enrollment', action: 'cancel', code: @existing_enrollment.code}
    )
  end

  test 'cancel with a known code deletes the enrollment' do
    assert_equal 1, Pd::Enrollment.count
    get :cancel, code: @existing_enrollment.code
    assert_response :success
    assert_equal 0, Pd::Enrollment.count
  end

  test 'cancel with an unknown code responds with 404' do
    get :cancel, code: 'not a valid code'
    assert_response 404
  end

  test 'join_section renders join_section form' do
    # start to create section
    @workshop.start!
    sign_in create(:teacher)
    get :join_section, section_code: @workshop.section.code
    assert_template :join_section
  end

  test 'join_section without login redirects to sign_in' do
    section = create :section
    get :join_section, section_code: section.code
    assert_redirected_to "/users/sign_in?return_to=#{request.url}"
  end

  test 'join_section with a nonexistent workshop code responds with 404' do
    sign_in create(:teacher)
    get :join_section, section_code: 'nonsense'
    assert_response 404

    # Same with a valid section code that is not associated with a workshop
    section = create :section
    get :join_section, section_code: section.code
    assert_response 404
  end

  test 'join_section with closed workshop renders closed view' do
    sign_in create(:teacher)
    workshop = create :pd_ended_workshop
    get :join_section, section_code: workshop.section.code
    assert_template :closed
  end

  test 'join_section for workshop I organize renders own view' do
    # start to create section
    @workshop.start!
    sign_in @organizer
    get :join_section, section_code: @workshop.section.code
    assert_template :own
  end

  test 'join_section for workshop I facilitate renders own view' do
    # start to create section
    @workshop.start!
    sign_in @facilitator
    get :join_section, section_code: @workshop.section.code
    assert_template :own
  end

  test 'confirm_join without login renders 404' do
    # start to create section
    @workshop.start!
    post :confirm_join, section_code: @workshop.section.code
    assert_response 404
  end

  test 'confirm_join succeeds and joins the section' do
    # start to create section
    @workshop.start!
    teacher = create :teacher
    sign_in teacher
    create :pd_enrollment, name: teacher.name, email: teacher.email

    assert_creates(Follower) do
      post :confirm_join, section_code: @workshop.section.code, pd_enrollment: enrollment_test_params(teacher)
    end

    # Make sure the new follower is for our expected teacher and workshop section
    follower = Follower.last
    assert_equal teacher.id, follower.student_user_id
    assert_equal @workshop.section.id, follower.section_id
  end

  test 'confirm_join with no enrollment creates enrollment' do
    # start to create section
    @workshop.start!
    teacher = create :teacher
    sign_in teacher

    assert_creates(Pd::Enrollment, Follower) do
      post :confirm_join, section_code: @workshop.section.code, pd_enrollment: enrollment_test_params(teacher)
    end
    enrollment = Pd::Enrollment.last
    assert_equal teacher.id, enrollment.user_id
    assert_equal teacher.email, enrollment.email
    assert_equal teacher.name, enrollment.name
    assert_redirected_to '/'
    assert_equal "You've registered for #{@workshop.section.name}.", flash[:notice]
  end

  test 'confirm_join for a student account converts it to teacher and sets email' do
    # start to create section
    @workshop.start!
    params = enrollment_test_params

    # student hashed_email must match the supplied email below,
    student = create :student, email: params[:email]
    sign_in student

    assert_creates(Pd::Enrollment, Follower) do
      post :confirm_join, section_code: @workshop.section.code, pd_enrollment: params
    end

    student.reload
    assert student.teacher?
    assert_equal params[:email], student.email
    assert_redirected_to '/'
    assert_equal "You've registered for #{@workshop.section.name}.", flash[:notice]
  end

  test 'confirm_join with an email mismatch with the user email renders join_section' do
    # start to create section
    @workshop.start!
    sign_in create(:teacher)

    params = enrollment_test_params.merge({email: 'mismatched_email@example.net'})
    post :confirm_join, section_code: @workshop.section.code, pd_enrollment: params
    assert_template :join_section
  end

  test 'confirm_join with validation errors renders join_section' do
    # start to create section
    @workshop.start!
    sign_in create(:teacher)
    post :confirm_join, section_code: @workshop.section.code, pd_enrollment: {email: nil}
    assert_template :join_section
  end

  private

  def enrollment_test_params(teacher = nil)
    if teacher
      name = teacher.name
      email = teacher.email
    else
      name = "teacher#{SecureRandom.hex(4)}"
      email = "#{name}@example.net"
    end
    {
      name: name,
      email: email,
      email_confirmation: email,
      school: 'test enrollment school',
      school_type: 'public',
      school_state: 'WA',
      school_district_id: create(:school_district).id
    }
  end
end
