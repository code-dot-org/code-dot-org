require 'test_helper'

class Api::V1::UsersControllerTest < ActionController::TestCase
  self.use_transactional_test_case = true

  setup do
    @user = create :user
  end

  test 'a get request to using_text_mode returns using_text_mode attribute of user object' do
    sign_in(@user)
    get :get_using_text_mode, params: {user_id: 'me'}
    assert_response :success
    response = JSON.parse(@response.body)
    assert_equal false, response["using_text_mode"]
  end

  test_user_gets_response_for(
    :post_using_text_mode,
    user: nil,
    params: {user_id: 'me', using_text_mode: 'true'},
    response: :forbidden
  )

  test 'a post request to using_text_mode updates using_text_mode' do
    sign_in(@user)
    assert !@user.using_text_mode
    post :post_using_text_mode, params: {user_id: 'me', using_text_mode: 'true'}
    assert_response :success
    response = JSON.parse(@response.body)
    assert response["using_text_mode"]
    @user.reload
    assert @user.using_text_mode

    post :post_using_text_mode, params: {user_id: 'me', using_text_mode: 'false'}
    assert_response :success
    response = JSON.parse(@response.body)
    assert_equal false, response["using_text_mode"]
    @user.reload
    assert_equal false, !!@user.using_text_mode
  end

  test 'will 403 if given a user id other than the person logged in' do
    sign_in(@user)
    post :post_using_text_mode, params: {user_id: '12345', using_text_mode: 'true'}
    assert_response 403
  end

  test 'a post request to post_ui_tip_dismissed updates ui_tip_dismissed_homepage_header' do
    sign_in(@user)
    @user.ui_tip_dismissed_homepage_header = false
    refute @user.ui_tip_dismissed_homepage_header
    post :post_ui_tip_dismissed, params: {user_id: 'me', tip: 'homepage_header'}
    assert_response :success
    @user.reload
    assert @user.ui_tip_dismissed_homepage_header
  end

  test 'a post request to postpone_census_banner updates next_census_display' do
    test_user = create :user
    sign_in(test_user)
    post :postpone_census_banner, params: {user_id: 'me'}
    assert_response :success
    response = JSON.parse(@response.body)
    test_user.reload
    assert_equal response["next_census_display"], test_user.next_census_display
  end

  test 'a post request to dismiss_census_banner updates next_census_display' do
    test_user = create :user
    sign_in(test_user)
    post :dismiss_census_banner, params: {user_id: 'me'}
    assert_response :success
    response = JSON.parse(@response.body)
    test_user.reload
    assert_equal response["next_census_display"], test_user.next_census_display
  end
end
