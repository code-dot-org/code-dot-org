require 'test_helper'

class Api::V1::Pd::WorkshopEnrollmentsControllerTest < ::ActionController::TestCase
  setup do
    @organizer = create :workshop_organizer
    @program_manager = create :program_manager
    @facilitator = create :facilitator

    @organizer_workshop = create :pd_workshop, organizer: @organizer, facilitators: [@facilitator]
    @organizer_workshop_enrollment = create :pd_enrollment, workshop: @organizer_workshop

    @workshop = create :pd_workshop, organizer: @program_manager, facilitators: [@facilitator]
    @enrollment = create :pd_enrollment, workshop: @workshop

    @unrelated_workshop = create :pd_workshop
    @unrelated_enrollment = create :pd_enrollment, workshop: @unrelated_workshop
  end

  CONTROLLER_PATH = 'api/v1/pd/workshop_enrollments'

  test 'routes' do
    assert_routing(
      {method: :get, path: "/api/v1/pd/workshops/#{@workshop.id}/enrollments"},
      {controller: CONTROLLER_PATH, action: 'index', workshop_id: @workshop.id.to_s}
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
end
