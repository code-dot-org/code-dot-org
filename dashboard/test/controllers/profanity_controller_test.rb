require 'test_helper'

class ProfanityControllerTest < ActionController::TestCase
  include ProfanityHelper

  setup do
    @profane_text = 'bad words'
    @expected_profanities = ['bad']
    @locale = 'en-US'
    @user = create(:user)
    sign_in(@user)
  end

  test 'find: returns profanities using user id' do
    ProfanityHelper.expects(:throttled_find_profanities).once.
      with(@profane_text, @locale, @user.id, ProfanityController::REQUEST_LIMIT_PER_MIN_DEFAULT, 60).
      yields(@expected_profanities)
    post :find, params: {text: @profane_text, locale: @locale}
    assert_response :success
    assert_equal @expected_profanities.to_json, @response.body
  end

  test 'find: returns profanities using session id if no user id' do
    sign_out(@user)
    ProfanityHelper.expects(:throttled_find_profanities).once.
      with(@profane_text, @locale, session.id, ProfanityController::REQUEST_LIMIT_PER_MIN_DEFAULT, 60).
      yields(@expected_profanities)
    post :find, params: {text: @profane_text, locale: @locale}
    assert_response :success
    assert_equal @expected_profanities.to_json, @response.body
  end

  test 'find: returns profanities using IP if no user/session id' do
    sign_out(@user)
    session.expects(:id).once.returns(nil)
    ProfanityHelper.expects(:throttled_find_profanities).once.
      with(@profane_text, @locale, @request.ip, ProfanityController::REQUEST_LIMIT_PER_MIN_IP, 60).
      yields(@expected_profanities)
    post :find, params: {text: @profane_text, locale: @locale}
    assert_response :success
    assert_equal @expected_profanities.to_json, @response.body
  end

  test 'find: returns null if params[:text] is empty' do
    post :find, params: {text: ""}
    assert_response :success
    assert_equal "null", @response.body
  end

  test 'find: returns 429 if request is throttled' do
    ProfanityHelper.expects(:throttled_find_profanities).once.returns(nil)
    post :find, params: {text: 'hola', locale: 'es-MX'}
    assert_response :too_many_requests
  end
end
