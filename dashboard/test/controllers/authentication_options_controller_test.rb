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

  test 'disconnect: returns bad_request if user is not signed in' do
    delete '/users/auth/1/disconnect'
    assert_response :bad_request
  end

  test 'disconnect: returns bad_request if user is not migrated' do
    user = create :user, :unmigrated_facebook_sso
    sign_in user

    delete '/users/auth/1/disconnect'
    assert_response :bad_request
  end

  test 'disconnect: destroys the AuthenticationOption if it exists and is not primary' do
    user = create :user, :multi_auth_migrated, primary_contact_info: create(:authentication_option)
    auth_option = create :authentication_option, user: user
    sign_in user

    assert_destroys(AuthenticationOption) do
      delete "/users/auth/#{auth_option.id}/disconnect"
      assert_response :success
      assert_raises ActiveRecord::RecordNotFound do
        AuthenticationOption.find(auth_option.id)
      end
    end
  end

  test 'disconnect: if the removed AuthenticationOption was primary and a replacement is available, replaces it' do
    email = 'example@gmail.com'
    teacher = create :teacher, :multi_auth_migrated
    google_option = create :google_authentication_option, user: teacher, email: email
    facebook_option = create :facebook_authentication_option, user: teacher, email: email
    teacher.update(primary_contact_info: google_option)
    teacher.reload

    # Preconditions
    assert_equal 2, teacher.authentication_options.size
    assert_includes teacher.authentication_options, google_option
    assert_includes teacher.authentication_options, facebook_option
    assert_equal google_option, teacher.primary_contact_info

    sign_in teacher
    delete "/users/auth/#{teacher.primary_contact_info_id}/disconnect"
    assert_response :success

    teacher.reload
    assert_equal 1, teacher.authentication_options.size
    refute_includes teacher.authentication_options, google_option
    assert_includes teacher.authentication_options, facebook_option
    assert_equal facebook_option, teacher.primary_contact_info
  end

  test 'disconnect: if the removed AuthenticationOption was primary and no replacement is available, creates one' do
    email = 'example@gmail.com'
    teacher = create :teacher, :multi_auth_migrated
    google_option = create :google_authentication_option, user: teacher, email: email
    teacher.update(primary_contact_info: google_option)
    teacher.reload

    # Preconditions
    assert_equal 1, teacher.authentication_options.size
    assert_includes teacher.authentication_options, google_option
    assert_equal google_option, teacher.primary_contact_info
    refute_empty teacher.encrypted_password

    sign_in teacher
    delete "/users/auth/#{teacher.primary_contact_info_id}/disconnect"
    assert_response :success

    teacher.reload
    assert_equal 1, teacher.authentication_options.size
    refute_includes teacher.authentication_options, google_option
    assert_authentication_option teacher.primary_contact_info,
      user: teacher,
      email: email,
      hashed_email: User.hash_email(email),
      credential_type: AuthenticationOption::EMAIL,
      authentication_id: User.hash_email(email)
  end

  test 'disconnect: returns not_found if the AuthenticationOption does not exist' do
    user = create :user, :multi_auth_migrated
    sign_in user

    assert_does_not_destroy(AuthenticationOption) do
      delete "/users/auth/1/disconnect"
      assert_response :not_found
    end
  end

  test 'disconnect: returns not_found if the AuthenticationOption does not belong to the current user' do
    user = create :user, :multi_auth_migrated
    auth_option = create :authentication_option
    sign_in user

    assert_does_not_destroy(AuthenticationOption) do
      delete "/users/auth/#{auth_option.id}/disconnect"
      assert_response :not_found
    end
  end
end
