require 'test_helper'

class Api::V1::Pd::WorkshopEnrollmentsControllerTest < ::ActionController::TestCase
  setup do
    @organizer = create :workshop_organizer
    @facilitator = create :facilitator

    @workshop = create :pd_workshop, organizer: @organizer, facilitators: [@facilitator]
    @enrollment = create :pd_enrollment, workshop: @workshop

    @unrelated_workshop = create :pd_workshop
    @unrelated_enrollment = create :pd_enrollment, workshop: @unrelated_workshop
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
end
