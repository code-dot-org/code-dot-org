require 'test_helper'
class Pd::WorkshopEnrollmentControllerTest < ::ActionController::TestCase

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

  test 'new action for organizer renders own view' do
    sign_in @organizer
    get :new, workshop_id: @workshop.id
    assert_template :own
  end

  test 'new action for facilitator renders own view' do
    sign_in @facilitator
    get :new, workshop_id: @workshop.id
    assert_template :own
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

  test 'enrollments can be created' do
    assert_creates(Pd::Enrollment) do
      post :create, workshop_id: @workshop.id, pd_enrollment: enrollment_test_params
    end
    enrollment = Pd::Enrollment.last
    refute_nil enrollment.code
    assert_redirected_to action: :show, code: enrollment.code
  end

  test 'enroll post route' do
    assert_routing(
      {path: "/pd/workshops/#{@workshop.id}/enroll", method: :post},
      {controller: 'pd/workshop_enrollment', action: 'create', workshop_id: @workshop.id.to_s}
    )
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

  private

  def enrollment_test_params
    name = "teacher#{SecureRandom.hex(4)}"
    email = "#{name}@example.net"
    {
      name: name,
      email: email,
      email_confirmation: email,
      school: 'test enrollment school',
      district: 'test enrollment district'
    }
  end

end
