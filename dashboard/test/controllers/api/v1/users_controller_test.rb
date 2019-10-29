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

  test 'accept_data_transfer_agreement updates user properties' do
    sign_in(@user)
    @user.data_transfer_agreement_accepted = false
    refute @user.data_transfer_agreement_accepted
    Timecop.freeze do
      post :accept_data_transfer_agreement, params: {user_id: @user.id}
      assert_response :success
      @user.reload
      assert @user.data_transfer_agreement_accepted
      assert_equal @user.data_transfer_agreement_at, DateTime.now.iso8601(3)
      assert @user.data_transfer_agreement_request_ip
      assert_equal @user.data_transfer_agreement_source, User::ACCEPT_DATA_TRANSFER_DIALOG
      assert_equal @user.data_transfer_agreement_kind, "0"
    end
  end

  test 'if accept_data_transfer_agreement is already set, it should not update data_transfer_agreement_accepted_at' do
    sign_in(@user)
    @user.data_transfer_agreement_accepted = false
    Timecop.freeze do
      post :accept_data_transfer_agreement, params: {user_id: 'me'}
      assert_response :success
      @user.reload
      assert_equal @user.data_transfer_agreement_at, DateTime.now.iso8601(3)
      Timecop.travel 1.hour
      orignal_time = @user.data_transfer_agreement_at
      post :accept_data_transfer_agreement, params: {user_id: @user.id}
      assert_response :success
      @user.reload
      assert_equal @user.data_transfer_agreement_at, orignal_time
    end
  end

  test 'accept_data_transfer_agreement will 403 if given a user id other than the person logged in' do
    sign_in(@user)
    post :accept_data_transfer_agreement, params: {user_id: '12345'}
    assert_response 403
  end

  test 'accept_data_transfer_agreement will 403 if no user id' do
    post :accept_data_transfer_agreement
    assert_response 403
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

  test 'a post request to dismiss_donor_teacher_banner' do
    test_user = create :user
    sign_in(test_user)
    post :dismiss_donor_teacher_banner, params: {user_id: 'me', participate: true, source: 'marketing'}
    assert_response :success
    test_user.reload
    dismissed_value = {'participate' => true, 'source' => 'marketing'}
    assert_equal dismissed_value, test_user.donor_teacher_banner_dismissed
  end

  test "a get request to get school_name returns school object" do
    sign_in(@user)
    get :get_school_name, params: {user_id: @user.id}
    assert_response :success
    response = JSON.parse(@response.body)
    assert_equal @user.school, response["school_name"]
  end

  test "school name is not returned for a user that is not signed in" do
    get :get_school_name, params: {user_id: 234}
    assert_response 403
  end

  test 'get school name will 403 if given a user id other than the person logged in' do
    sign_in(@user)
    get :get_school_name, params: {user_id: @user.id + 1}
    assert_response 403
  end

  test "get_school_user will 403 if user id does not exist" do
    sign_in(@user)
    get :get_school_name, params: {user_id: '-1'}
    assert_response 403
  end
end
