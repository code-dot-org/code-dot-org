require 'test_helper'

module RegistrationsControllerTests
  #
  # Tests over GET /users/sign_up
  #
  class NewTest < ActionDispatch::IntegrationTest
    test 'renders signup form if partial registration is not in progress' do
      SignUpTracking.expects(:begin_sign_up_tracking)

      get '/users/sign_up'
      assert_response :success
      assert_template partial: '_sign_up'
    end

    test "signup does not display errors on pageload" do
      PartialRegistration.stubs(:in_progress?).returns(true)
      user = build :student, provider: 'facebook', email: 'email@facebook.xx'
      User.expects(:new_with_session).returns(user)

      get '/users/sign_up'

      assert_equal 'email@facebook.xx', assigns(:user).email
      assert_nil assigns(:user).username
      assert_empty assigns(:user).errors.full_messages
    end

    test 'renders finish_sign_up partial registration is in progress' do
      PartialRegistration.stubs(:in_progress?).returns(true)
      User.expects(:new_with_session).returns(build(:user))

      get '/users/sign_up'
      assert_response :success
      assert_template partial: '_finish_sign_up'
    end

    test 'user type is typically blank on finish_sign_up' do
      get '/users/sign_up'
      start_email_password_signup
      assert_template partial: '_finish_sign_up'
      assert_nil assigns(:user).user_type
    end

    test 'queryparam user[user_type] sets default user type on finish_sign_up' do
      get '/users/sign_up?user[user_type]=teacher'
      start_email_password_signup
      assert_template partial: '_finish_sign_up'
      assert_equal 'teacher', assigns(:user).user_type
    end

    test 'queryparam user[user_type] ignores invalid user types' do
      get '/users/sign_up?user[user_type]=lemon'
      start_email_password_signup
      assert_template partial: '_finish_sign_up'
      assert_nil assigns(:user).user_type
    end

    test 'visiting sign_up without the user_type param clears a previous setting' do
      get '/users/sign_up?user[user_type]=teacher'
      start_email_password_signup
      assert_template partial: '_finish_sign_up'
      assert_equal 'teacher', assigns(:user).user_type

      get '/users/cancel'

      get '/users/sign_up?user[user_type]=student'
      start_email_password_signup
      assert_template partial: '_finish_sign_up'
      assert_equal 'student', assigns(:user).user_type

      get '/users/cancel'

      get '/users/sign_up'
      start_email_password_signup
      assert_template partial: '_finish_sign_up'
      assert_nil assigns(:user).user_type
    end

    test 'visting sign-up with a user_type queryparam when sign-up is in progress, the queryparam wins' do
      get '/users/sign_up?user[user_type]=student'
      start_email_password_signup
      assert_template partial: '_finish_sign_up'
      assert_equal 'student', assigns(:user).user_type

      get '/users/sign_up?user[user_type]=teacher'
      assert_response :success, response.body
      assert_template partial: '_finish_sign_up'
      assert_equal 'teacher', assigns(:user).user_type
    end

    private

    def start_email_password_signup
      post '/users/begin_sign_up', params: {
        user: {
          email: 'myemail@example.com',
          password: 'mypassword',
          password_confirmation: 'mypassword'
        }
      }
      assert_redirected_to new_user_registration_path
      follow_redirect!
    end
  end
end
