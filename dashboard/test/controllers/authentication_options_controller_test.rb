require 'test_helper'

class AuthenticationOptionsControllerTest < ActionDispatch::IntegrationTest
  test 'disconnect: redirects with an error message if user is not signed in' do
    post '/users/auth/1/disconnect'
    assert_includes(flash[:alert], 'Sorry')
    assert_response :redirect
  end

  test 'disconnect: destroys the AuthenticationOption if it exists and is not primary' do
    user = create(:user)
    auth_option = create(:authentication_option, user: user)
    sign_in user

    assert_destroys(AuthenticationOption) do
      post "/users/auth/#{auth_option.id}/disconnect"
      assert_includes(flash[:notice], "Success!")
      assert_response :redirect
      assert_raises ActiveRecord::RecordNotFound do
        AuthenticationOption.find(auth_option.id)
      end
    end
  end

  test 'disconnect: if the removed AuthenticationOption was primary and a replacement is available, replaces it' do
    email = 'example@gmail.com'
    teacher = create(:teacher)
    google_option = create(:google_authentication_option, user: teacher, email: email)
    facebook_option = create(:facebook_authentication_option, user: teacher, email: email)
    teacher.update(primary_contact_info: google_option)
    teacher.reload

    # Preconditions
    assert_equal 3, teacher.authentication_options.size
    assert_includes teacher.authentication_options, google_option
    assert_includes teacher.authentication_options, facebook_option
    assert_equal google_option, teacher.primary_contact_info

    sign_in teacher
    post "/users/auth/#{teacher.primary_contact_info_id}/disconnect"
    assert_includes(flash[:notice], "Success!")
    assert_response :redirect

    teacher.reload
    assert_equal 2, teacher.authentication_options.size
    refute_includes teacher.authentication_options, google_option
    assert_includes teacher.authentication_options, facebook_option
    assert_equal facebook_option, teacher.primary_contact_info
  end

  test 'disconnect: if the removed AuthenticationOption was primary and no replacement is available, creates one' do
    email = 'example@gmail.com'
    teacher = create(:teacher)
    google_option = create(:google_authentication_option, user: teacher, email: email)
    teacher.update(primary_contact_info: google_option)
    teacher.reload

    # Preconditions
    assert_equal 2, teacher.authentication_options.size
    assert_includes teacher.authentication_options, google_option
    assert_equal google_option, teacher.primary_contact_info
    refute_empty teacher.encrypted_password

    sign_in teacher
    post "/users/auth/#{teacher.primary_contact_info_id}/disconnect"
    assert_includes(flash[:notice], "Success!")
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

  test 'disconnect: removes every ClassLink option when one of them is disconnected' do
    teacher = create(:teacher)
    v1_option = create_classlink_option(teacher, version: nil, authentication_id: '12345678')
    v2_option = create_classlink_option(teacher, version: AuthenticationOption::Classlink::VERSION[:v2], authentication_id: 'tenant|sourced')
    google_option = create(:google_authentication_option, user: teacher, email: teacher.email)
    teacher.reload

    # Preconditions
    assert_equal 4, teacher.authentication_options.size

    sign_in teacher
    post "/users/auth/#{v2_option.id}/disconnect"
    assert_includes(flash[:notice], "Success!")
    assert_response :redirect

    teacher.reload
    assert_equal 2, teacher.authentication_options.size
    refute_includes teacher.authentication_options, v1_option
    refute_includes teacher.authentication_options, v2_option
    assert_includes teacher.authentication_options, google_option
  end

  test 'disconnect: replaces primary_contact_info when it was a hidden ClassLink option' do
    email = 'example@gmail.com'
    teacher = create(:teacher, email: email)
    v1_option = create_classlink_option(teacher, version: nil, authentication_id: '12345678')
    v2_option = create_classlink_option(teacher, version: AuthenticationOption::Classlink::VERSION[:v2], authentication_id: 'tenant|sourced')
    teacher.update(primary_contact_info: v1_option)
    teacher.reload

    # Preconditions
    assert_equal v1_option, teacher.primary_contact_info

    sign_in teacher
    post "/users/auth/#{v2_option.id}/disconnect"
    assert_response :redirect

    teacher.reload
    refute_includes teacher.authentication_options, v1_option
    refute_includes teacher.authentication_options, v2_option
    assert_authentication_option teacher.primary_contact_info,
      user: teacher,
      email: email,
      hashed_email: User.hash_email(email),
      credential_type: AuthenticationOption::EMAIL,
      authentication_id: User.hash_email(email)
  end

  test 'disconnect: leaves other providers alone when disconnecting a non-ClassLink option' do
    teacher = create(:teacher)
    classlink_option = create_classlink_option(teacher, version: nil, authentication_id: '12345678')
    google_option = create(:google_authentication_option, user: teacher, email: teacher.email)
    teacher.reload

    sign_in teacher
    post "/users/auth/#{google_option.id}/disconnect"
    assert_response :redirect

    teacher.reload
    refute_includes teacher.authentication_options, google_option
    assert_includes teacher.authentication_options, classlink_option
  end

  test 'disconnect: returns not_found if the AuthenticationOption does not exist' do
    user = create(:user)
    sign_in user

    assert_does_not_destroy(AuthenticationOption) do
      post "/users/auth/1/disconnect"
      assert_response :not_found
    end
  end

  test 'disconnect: returns not_found if the AuthenticationOption does not belong to the current user' do
    user = create(:user)
    auth_option = create(:authentication_option)
    sign_in user

    assert_does_not_destroy(AuthenticationOption) do
      post "/users/auth/#{auth_option.id}/disconnect"
      assert_response :not_found
    end
  end

  private def create_classlink_option(user, version:, authentication_id:)
    create(
      :authentication_option,
      user: user,
      email: user.email,
      hashed_email: user.hashed_email,
      credential_type: AuthenticationOption::CLASSLINK,
      authentication_id: authentication_id,
      version: version
    )
  end
end
