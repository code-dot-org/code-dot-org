require 'test_helper'

class JavaBuilderSessionsControllerTest < ActionController::TestCase
  test 'levelbuilder can get access token' do
    levelbuilder = create :levelbuilder
    sign_in(levelbuilder)
    get :get_access_token
    assert_response :success
  end

  test 'csa pilot participant can get access token' do
    user = create :user
    create(:single_user_experiment, min_user_id: user.id, name: 'csa-pilot')
    sign_in(user)
    get :get_access_token
    assert_response :success
  end

  test 'regular user cannot get access token' do
    user = create :user
    sign_in(user)
    get :get_access_token
    assert_response :forbidden
  end
end
