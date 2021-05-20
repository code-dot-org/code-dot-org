require 'test_helper'

class AuthenticationOptionsControllerTest < ActionDispatch::IntegrationTest
  test 'disconnect: redirects with an error message if user is not signed in' do
    post '/users/auth/1/disconnect'
    assert flash[:alert].include? 'Sorry'
    assert_response :redirect
  end

  test 'disconnect: destroys the AuthenticationOption if it exists and is not primary' do
    user = create :user
    auth_option = create :authentication_option, user: user
    sign_in user

    assert_destroys(AuthenticationOption) do
      post "/users/auth/#{auth_option.id}/disconnect"
      assert flash[:notice].include? "Success!"
      assert_response :redirect
      assert_raises ActiveRecord::RecordNotFound do
        AuthenticationOption.find(auth_option.id)
      end
    end
  end

  test 'disconnect: if the removed AuthenticationOption was primary and a replacement is available, replaces it' do
    email = 'example@gmail.com'
    teacher = create :teacher
    google_option = create :google_authentication_option, user: teacher, email: email
    facebook_option = create :facebook_authentication_option, user: teacher, email: email
    teacher.update(primary_contact_info: google_option)
    teacher.reload

    # Preconditions
    assert_equal 3, teacher.authentication_options.size
    assert_includes teacher.authentication_options, google_option
    assert_includes teacher.authentication_options, facebook_option
    assert_equal google_option, teacher.primary_contact_info

    sign_in teacher
    post "/users/auth/#{teacher.primary_contact_info_id}/disconnect"
    assert flash[:notice].include? "Success!"
    assert_response :redirect

    teacher.reload
    assert_equal 2, teacher.authentication_options.size
    refute_includes teacher.authentication_options, google_option
    assert_includes teacher.authentication_options, facebook_option
    assert_equal facebook_option, teacher.primary_contact_info
  end

  test 'disconnect: if the removed AuthenticationOption was primary and no replacement is available, creates one' do
    email = 'example@gmail.com'
    teacher = create :teacher
    google_option = create :google_authentication_option, user: teacher, email: email
    teacher.update(primary_contact_info: google_option)
    teacher.reload

    # Preconditions
    assert_equal 2, teacher.authentication_options.size
    assert_includes teacher.authentication_options, google_option
    assert_equal google_option, teacher.primary_contact_info
    refute_empty teacher.encrypted_password

    sign_in teacher
    post "/users/auth/#{teacher.primary_contact_info_id}/disconnect"
    assert flash[:notice].include? "Success!"
    assert_response :redirect

    teacher.reload
    assert_equal 2, teacher.authentication_options.size
    refute_includes teacher.authentication_options, google_option
    assert_authentication_option teacher.primary_contact_info,
      user: teacher,
      email: email,
      hashed_email: User.hash_email(email),
      credential_type: AuthenticationOption::EMAIL,
      authentication_id: User.hash_email(email)
  end

  test 'disconnect: returns not_found if the AuthenticationOption does not exist' do
    user = create :user
    sign_in user

    assert_does_not_destroy(AuthenticationOption) do
      post "/users/auth/1/disconnect"
      assert_response :not_found
    end
  end

  test 'disconnect: returns not_found if the AuthenticationOption does not belong to the current user' do
    user = create :user
    auth_option = create :authentication_option
    sign_in user

    assert_does_not_destroy(AuthenticationOption) do
      post "/users/auth/#{auth_option.id}/disconnect"
      assert_response :not_found
    end
  end
end
