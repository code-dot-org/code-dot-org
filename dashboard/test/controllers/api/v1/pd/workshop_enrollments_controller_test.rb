require 'test_helper'

class Api::V1::Pd::WorkshopEnrollmentsControllerTest < ::ActionController::TestCase
  setup do
    @organizer = create :workshop_organizer
    @facilitator = create :facilitator

    @workshop = create :pd_workshop, organizer: @organizer, facilitators: [@facilitator]
    @school_info = create :school_info
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
  end

  test 'admins can see enrollments for all workshops' do
    sign_in create(:admin)
    get :index, workshop_id: @unrelated_workshop.id
    assert_response :success
    response_json = JSON.parse(@response.body)
    assert_equal 1, response_json.length
    assert_equal @unrelated_enrollment.email, response_json[0]['email']
  end

  test 'workshop organizers can see enrollemnts in their workshops' do
    sign_in @organizer
    get :index, workshop_id: @workshop.id
    assert_response :success
    response_json = JSON.parse(@response.body)
    assert_equal 1, response_json.length
    assert_equal @enrollment.email, response_json[0]['email']
  end

  test 'workshop organizers cannot see enrollments in workshops they are not organizing' do
    sign_in @organizer
    get :index, workshop_id: @unrelated_workshop.id
    assert_response :forbidden
  end

  test 'facilitators can see enrollments in their workshops' do
    sign_in @facilitator
    get :index, workshop_id: @workshop.id
    assert_response :success
    response_json = JSON.parse(@response.body)
    assert_equal 1, response_json.length
    assert_equal @enrollment.email, response_json[0]['email']
  end

  test 'facilitators cannot see enrollments in workshops they are not facilitating' do
    sign_in @facilitator
    get :index, workshop_id: @unrelated_workshop.id
    assert_response :forbidden
  end

  test 'teachers cannot see enrollments' do
    sign_in create(:teacher)
    get :index, workshop_id: @workshop.id
    assert_response :forbidden
  end

  test 'admins can delete enrollments from any workshop' do
    sign_in create(:admin)

    delete :destroy, workshop_id: @unrelated_workshop.id, id: @unrelated_enrollment.id
    assert_response :success
    refute Pd::Enrollment.exists?(@unrelated_enrollment.id)
  end

  test 'organizers can delete enrollments from their own workshops' do
    sign_in @organizer

    delete :destroy, workshop_id: @workshop.id, id: @enrollment.id
    assert_response :success
    refute Pd::Enrollment.exists?(@enrollment.id)
  end

  test 'organizers cannot delete enrollments from workshops they are not organizing' do
    sign_in @organizer

    delete :destroy, workshop_id: @unrelated_workshop.id, id: @unrelated_enrollment.id
    assert_response :forbidden
  end

  test 'facilitators can delete enrollments from their own workshops' do
    sign_in @facilitator

    delete :destroy, workshop_id: @workshop.id, id: @enrollment.id
    assert_response :success
    refute Pd::Enrollment.exists?(@enrollment.id)
  end

  test 'facilitators cannot delete enrollments from workshops they are not organizing' do
    sign_in @facilitator

    delete :destroy, workshop_id: @unrelated_workshop.id, id: @unrelated_enrollment.id
    assert_response :forbidden
  end

  test 'deleting an enrollment is idempotent' do
    sign_in create(:admin)

    delete :destroy, workshop_id: @workshop.id, id: @enrollment.id
    assert_response :success

    delete :destroy, workshop_id: @workshop.id, id: @enrollment.id
    assert_response :success

    # deleting a non-existent enrollment also succeeds
    delete :destroy, workshop_id: @workshop.id, id: @unrelated_enrollment.id
    assert_response :success
  end
end
