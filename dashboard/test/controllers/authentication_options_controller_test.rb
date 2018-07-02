require 'test_helper'

class AuthenticationOptionsControllerTest < ActionDispatch::IntegrationTest
  test 'connect: returns bad_request if user not signed in' do
    get '/users/auth/google_oauth2/connect'
    assert_response :bad_request
  end

  test 'connect: returns bad_request if user not migrated' do
    user = create :user, :unmigrated_facebook_sso
    sign_in user
    get '/users/auth/google_oauth2/connect'
    assert_response :bad_request
  end

  test 'connect: returns bad_request if provider not supported' do
    user = create :user, :multi_auth_migrated
    sign_in user
    get '/users/auth/some_fake_provider/connect'
    assert_response :bad_request
  end

  test 'connect: sets connect_provider on session and redirects to google authorization' do
    user = create :user, :multi_auth_migrated
    sign_in user

    Timecop.freeze do
      get '/users/auth/google_oauth2/connect'
      assert_equal 2.minutes.from_now, session[:connect_provider]
      assert_redirected_to '/users/auth/google_oauth2'
    end
  end

  test 'connect: sets connect_provider on session and redirects to facebook authorization' do
    user = create :user, :multi_auth_migrated
    sign_in user

    Timecop.freeze do
      get '/users/auth/facebook/connect'
      assert_equal 2.minutes.from_now, session[:connect_provider]
      assert_redirected_to '/users/auth/facebook'
    end
  end

  test 'connect: sets connect_provider on session and redirects to windowslive authorization' do
    user = create :user, :multi_auth_migrated
    sign_in user

    Timecop.freeze do
      get '/users/auth/windowslive/connect'
      assert_equal 2.minutes.from_now, session[:connect_provider]
      assert_redirected_to '/users/auth/windowslive'
    end
  end

  test 'connect: sets connect_provider on session and redirects to clever authorization' do
    user = create :user, :multi_auth_migrated
    sign_in user

    Timecop.freeze do
      get '/users/auth/clever/connect'
      assert_equal 2.minutes.from_now, session[:connect_provider]
      assert_redirected_to '/users/auth/clever'
    end
  end

  test 'connect: sets connect_provider on session and redirects to powerschool authorization' do
    user = create :user, :multi_auth_migrated
    sign_in user

    Timecop.freeze do
      get '/users/auth/powerschool/connect'
      assert_equal 2.minutes.from_now, session[:connect_provider]
      assert_redirected_to '/users/auth/powerschool'
    end
  end
end
