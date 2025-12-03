require 'test_helper'

class AidiffArtifactsControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    @teacher_sans_experiment = create(:teacher)
    @teacher = create(:teacher)

    create(:single_user_experiment, min_user_id: @teacher.id, name: 'ai-differentiation')
    create(:single_user_experiment, min_user_id: @teacher_sans_experiment.id, name: 'ai-differentiation')
    create(:single_user_experiment, min_user_id: @teacher.id, name: 'ai-artifact')
  end

  test "index redirects to signin when teacher not signed in" do
    get :index
    assert_redirected_to_sign_in
  end

  test "index returns forbidden when teacher not in experiment" do
    sign_in @teacher_sans_experiment
    get :index
    assert_response :forbidden
  end

  test "index returns only user-owned exit tickets" do
    #some other user's exit ticket
    @teacher2 = create(:teacher)
    create(:single_user_experiment, min_user_id: @teacher2.id, name: 'ai-differentiation')
    create(:aidiff_exit_ticket, user: @teacher2)

    #this user's exit ticket
    sign_in @teacher
    create(:aidiff_exit_ticket, user: @teacher, title: "title 1")
    create(:aidiff_exit_ticket, user: @teacher, title: "title 2")

    get :index

    assert_response :success
    json_response = JSON.parse(response.body)
    assert_equal 2, json_response.count
    assert_equal "title 1", json_response[0]["title"]
    assert_equal "title 2", json_response[1]["title"]
  end
end
