require 'test_helper'

class Api::V1::Pd::WorkshopEnrollmentsControllerTest < ::ActionController::TestCase
  setup do
    @organizer = create :workshop_organizer
    @program_manager = create :program_manager
    @facilitator = create :facilitator

    @organizer_workshop = create :pd_workshop, organizer: @organizer, facilitators: [@facilitator]
    @organizer_workshop_enrollment = create :pd_enrollment, workshop: @organizer_workshop

    @workshop = create :pd_workshop, :with_codes_assigned, organizer: @program_manager, facilitators: [@facilitator], num_sessions: 1
    @enrollment = create :pd_enrollment, workshop: @workshop

    @unrelated_workshop = create :pd_workshop
    @unrelated_enrollment = create :pd_enrollment, workshop: @unrelated_workshop
  end

  CONTROLLER_PATH = 'api/v1/pd/workshop_enrollments'

  RESPONSE_MESSAGES = Api::V1::Pd::WorkshopEnrollmentsController::RESPONSE_MESSAGES

  test 'routes' do
    assert_routing(
      {method: :get, path: "/api/v1/pd/workshops/#{@workshop.id}/enrollments"},
      {controller: CONTROLLER_PATH, action: 'index', workshop_id: @workshop.id.to_s}
    )

    assert_routing(
      {path: "/api/v1/pd/workshops/#{@workshop.id}/enrollments", method: :post},
      {controller: CONTROLLER_PATH, action: 'create', workshop_id: @workshop.id.to_s}
    )

    assert_routing(
      {method: :delete, path: "/api/v1/pd/workshops/#{@workshop.id}/enrollments/#{@enrollment.id}"},
      {controller: CONTROLLER_PATH, action: 'destroy', workshop_id: @workshop.id.to_s, id: @enrollment.id.to_s}
    )

    assert_routing(
      {method: :delete, path: "/api/v1/pd/enrollments/#{@enrollment.code}"},
      {controller: CONTROLLER_PATH, action: 'cancel', enrollment_code: @enrollment.code.to_s}
    )
  end

  test 'admins can see enrollments for all workshops' do
    sign_in create(:admin)
    get :index, params: {workshop_id: @unrelated_workshop.id}
    assert_response :success
    response_json = JSON.parse(@response.body)
    assert_equal 1, response_json.length
    assert_equal @unrelated_enrollment.email, response_json[0]['email']
  end

  # TODO: remove this test when workshop_organizer is deprecated
  test 'workshop organizers can see enrollments in their workshops' do
    sign_in @organizer
    get :index, params: {workshop_id: @organizer_workshop.id}
    assert_response :success
    response_json = JSON.parse(@response.body)
    assert_equal 1, response_json.length
    assert_equal @organizer_workshop_enrollment.email, response_json[0]['email']
  end

  # TODO: remove this test when workshop_organizer is deprecated
  test 'workshop organizers cannot see enrollments in workshops they are not organizing' do
    sign_in @organizer
    get :index, params: {workshop_id: @unrelated_workshop.id}
    assert_response :forbidden
  end

  test 'program managers can see enrollments in their workshops' do
    sign_in @program_manager
    get :index, params: {workshop_id: @workshop.id}
    assert_response :success
    response_json = JSON.parse(@response.body)
    assert_equal 1, response_json.length
    assert_equal @enrollment.email, response_json[0]['email']
  end

  test 'program managers cannot see enrollments in workshops they are not organizing' do
    sign_in @program_manager
    get :index, params: {workshop_id: @unrelated_workshop.id}
    assert_response :forbidden
  end

  test 'facilitators can see enrollments in their workshops' do
    sign_in @facilitator
    get :index, params: {workshop_id: @workshop.id}
    assert_response :success
    response_json = JSON.parse(@response.body)
    assert_equal 1, response_json.length
    assert_equal @enrollment.email, response_json[0]['email']
  end

  test 'facilitators cannot see enrollments in workshops they are not facilitating' do
    sign_in @facilitator
    get :index, params: {workshop_id: @unrelated_workshop.id}
    assert_response :forbidden
  end

  test_user_gets_response_for(
    :index,
    user: :teacher,
    response: :forbidden,
    params: -> {{workshop_id: @workshop.id}}
  )

  test 'admins can delete enrollments from any workshop' do
    sign_in create(:admin)

    delete :destroy, params: {
      workshop_id: @unrelated_workshop.id,
      id: @unrelated_enrollment.id
    }
    assert_response :success
    refute Pd::Enrollment.exists?(@unrelated_enrollment.id)
  end

  # TODO: remove this test when workshop_organizer is deprecated
  test 'organizers can delete enrollments from their own workshops' do
    sign_in @organizer

    delete :destroy, params: {workshop_id: @organizer_workshop.id, id: @organizer_workshop_enrollment.id}
    assert_response :success
    refute Pd::Enrollment.exists?(@organizer_workshop_enrollment.id)
  end

  # TODO: remove this test when workshop_organizer is deprecated
  test 'organizers cannot delete enrollments from workshops they are not organizing' do
    sign_in @organizer

    delete :destroy, params: {
      workshop_id: @unrelated_workshop.id,
      id: @unrelated_enrollment.id
    }
    assert_response :forbidden
  end

  test 'program managers can delete enrollments from their own workshops' do
    sign_in @program_manager

    delete :destroy, params: {workshop_id: @workshop.id, id: @enrollment.id}
    assert_response :success
    refute Pd::Enrollment.exists?(@enrollment.id)
  end

  test 'program managers cannot delete enrollments from workshops they are not organizing' do
    sign_in @program_manager

    delete :destroy, params: {
      workshop_id: @unrelated_workshop.id,
      id: @unrelated_enrollment.id
    }
    assert_response :forbidden
  end

  test 'facilitators can delete enrollments from their own workshops' do
    sign_in @facilitator

    delete :destroy, params: {workshop_id: @workshop.id, id: @enrollment.id}
    assert_response :success
    refute Pd::Enrollment.exists?(@enrollment.id)
  end

  test 'facilitators cannot delete enrollments from workshops they are not organizing' do
    sign_in @facilitator

    delete :destroy, params: {
      workshop_id: @unrelated_workshop.id,
      id: @unrelated_enrollment.id
    }
    assert_response :forbidden
  end

  test 'deleting an enrollment is idempotent' do
    sign_in create(:admin)

    delete :destroy, params: {workshop_id: @workshop.id, id: @enrollment.id}
    assert_response :success

    delete :destroy, params: {workshop_id: @workshop.id, id: @enrollment.id}
    assert_response :success

    # deleting a non-existent enrollment also succeeds
    delete :destroy, params: {
      workshop_id: @workshop.id,
      id: @unrelated_enrollment.id
    }
    assert_response :success
  end

  test 'cancelling an active enrollment deletes it and sends email' do
    Pd::WorkshopMailer.expects(:teacher_cancel_receipt).returns(stub(:deliver_now))
    Pd::WorkshopMailer.expects(:organizer_cancel_receipt).returns(stub(:deliver_now))

    assert_destroys Pd::Enrollment do
      delete :cancel, params: {enrollment_code: @enrollment.code}
      assert_response :success
    end

    assert @enrollment.reload.deleted?
  end

  test 'cancelling a deleted enrollment does nothing' do
    Pd::WorkshopMailer.expects(:teacher_cancel_receipt).never
    Pd::WorkshopMailer.expects(:organizer_cancel_receipt).never

    @enrollment.destroy
    assert_does_not_destroy Pd::Enrollment do
      delete :cancel, params: {enrollment_code: @enrollment.code}
      assert_response :success
    end
  end

  test 'enrollments can be created' do
    assert_creates(Pd::Enrollment) do
      post :create, params: {
        workshop_id: @workshop.id,
        school_info: school_info_params
      }.merge(enrollment_test_params)
      assert_response :success
      assert_equal RESPONSE_MESSAGES[:SUCCESS], JSON.parse(@response.body)["workshop_enrollment_status"]
    end
    enrollment = Pd::Enrollment.last
    refute_nil enrollment.code
  end

  test 'creating a duplicate enrollment sends \'duplicate\' workshop enrollment status' do
    params = enrollment_test_params.merge(
      {
        first_name: @enrollment.first_name,
        last_name: @enrollment.last_name,
        email: @enrollment.email,
        confirmation_email: @enrollment.email,
      }
    )
    post :create, params: params.merge({workshop_id: @workshop.id})
    assert_response 400
    assert_equal RESPONSE_MESSAGES[:DUPLICATE], JSON.parse(@response.body)["workshop_enrollment_status"]
  end

  # TODO: remove this test when workshop_organizer is deprecated
  test 'creating an enrollment with email match from organizer sends \'own\' workshop enrollment status' do
    params = enrollment_test_params.merge(
      {
        full_name: @organizer.name,
        email: @organizer.email,
        confirmation_email: @organizer.email,
      }
    )
    post :create, params: params.merge({workshop_id: @organizer_workshop.id})
    assert_response 400
    assert_equal RESPONSE_MESSAGES[:OWN], JSON.parse(@response.body)["workshop_enrollment_status"]
  end

  test 'creating an enrollment with email match from program manager organizer sends \'own\' workshop enrollment status' do
    params = enrollment_test_params.merge(
      {
        full_name: @program_manager.name,
        email: @program_manager.email,
        confirmation_email: @program_manager.email,
      }
    )
    post :create, params: params.merge({workshop_id: @workshop.id})
    assert_response 400
    assert_equal RESPONSE_MESSAGES[:OWN], JSON.parse(@response.body)["workshop_enrollment_status"]
  end

  test 'creating an enrollment with email match from facilitator sends \'own\' workshop enrollment status' do
    params = enrollment_test_params.merge(
      {
        full_name: @facilitator.name,
        email: @facilitator.email,
        confirmation_email: @facilitator.email,
      }
    )
    post :create, params: params.merge({workshop_id: @workshop.id})
    assert_response 400
    assert_equal RESPONSE_MESSAGES[:OWN], JSON.parse(@response.body)["workshop_enrollment_status"]
  end

  test 'creating an enrollment with errors sends \'error\' workshop enrollment status' do
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
    assert_response 400
    assert_equal RESPONSE_MESSAGES[:ERROR], JSON.parse(@response.body)["workshop_enrollment_status"]
  end

  test 'creating an enrollment on an unknown workshop id returns 404' do
    post :create, params: enrollment_test_params.merge({workshop_id: 'nonsense'})
    assert_response 404
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
      school_type: 'private',
      school_state: 'WA',
      school_name: 'A Seattle private school',
      school_zip: '98102'
    }
  end
end
