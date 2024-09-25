require 'test_helper'
require_relative '../omniauth/utils'

module RegistrationsControllerTests
  #
  # Tests full integration of email signup
  #
  class EmailTest < ActionDispatch::IntegrationTest
    include OmniauthCallbacksControllerTests::Utils

    setup do
      stub_firehose

      # Force split-test to control group (override in tests over experiment)
      SignUpTracking.stubs(:split_test_percentage).returns(100)
    end

    test "student sign-up" do
      email = "student@example.com"

      get '/users/sign_up'
      assert_template partial: '_sign_up'
      post '/users/begin_sign_up', params: {
        user: {
          email: email,
          password: 'mypassword',
          password_confirmation: 'mypassword'
        }
      }
      assert_template partial: '_finish_sign_up'
      assert PartialRegistration.in_progress? session

      assert_creates(User) {finish_email_sign_up(false, User::TYPE_STUDENT, email)}
      assert_redirected_to '/'
      follow_redirect!
      assert_redirected_to '/home'
      assert_equal I18n.t('devise.registrations.signed_up'), flash[:notice]
      refute PartialRegistration.in_progress? session

      created_user = User.find signed_in_user_id
      assert_equal User.hash_email(email), created_user.hashed_email

      assert_sign_up_tracking(
        SignUpTracking::NEW_SIGN_UP_GROUP,
        %w(
          load-new-sign-up-page
          begin-sign-up-success
          email-load-finish-sign-up-page
          email-sign-up-success
        )
      )
    ensure
      created_user&.destroy!
    end

    test "student in new sign-up" do
      email = "student@example.com"

      post '/users/begin_sign_up', params: {
        new_sign_up: true,
        email: email,
        password: 'mypassword',
        password_confirmation: 'mypassword'
      }
      assert PartialRegistration.in_progress? session

      assert_creates(User) {finish_email_sign_up(true, User::TYPE_STUDENT, email)}

      refute PartialRegistration.in_progress? session

      created_user = User.find signed_in_user_id
      assert_equal User.hash_email(email), created_user.hashed_email

      assert_sign_up_tracking(
        SignUpTracking::NEW_SIGN_UP_GROUP,
        %w(
          load-new-sign-up-page
          begin-sign-up-success
          email-load-finish-sign-up-page
          email-sign-up-success
        )
      )
    ensure
      created_user&.destroy!
    end

    test "teacher in new sign-up" do
      email = "teacher@example.com"

      post '/users/begin_sign_up', params: {
        new_sign_up: true,
        email: email,
        password: 'mypassword',
        password_confirmation: 'mypassword'
      }
      assert PartialRegistration.in_progress? session

      assert_creates(User) {finish_email_sign_up(true, User::TYPE_TEACHER, email)}

      refute PartialRegistration.in_progress? session

      created_user = User.find signed_in_user_id
      assert_equal User.hash_email(email), created_user.hashed_email

      assert_sign_up_tracking(
        SignUpTracking::NEW_SIGN_UP_GROUP,
        %w(
          load-new-sign-up-page
          begin-sign-up-success
          email-load-finish-sign-up-page
          email-sign-up-success
        )
      )
    ensure
      created_user&.destroy!
    end

    private def finish_email_sign_up(new_sign_up, user_type, email)
      finish_params = new_sign_up.presence ? build_new_finish_sign_up_params(user_type, email) : finish_sign_up_params(user_type: user_type, email: email)
      post '/users', params: finish_params
    end

    private def build_new_finish_sign_up_params(user_type, email)
      new_finish_params = {
        new_sign_up: true,
        user_type: user_type,
        email: email,
        name: 'FakeName'
      }

      if user_type == User::TYPE_TEACHER
        new_finish_params[:email_preference_opt_in] = true
      elsif user_type == User::TYPE_STUDENT
        new_finish_params[:age] = '8'
        new_finish_params[:state] = 'AZ'
      end

      new_finish_params
    end
  end
end
