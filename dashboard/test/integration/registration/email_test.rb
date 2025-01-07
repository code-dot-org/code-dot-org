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

    test "student in new sign-up" do
      email = "student@example.com"

      post '/users/begin_sign_up', params: {
        new_sign_up: true,
        user: {
          email: email,
          password: 'mypassword',
          password_confirmation: 'mypassword'
        }
      }
      assert PartialRegistration.in_progress? session

      assert_creates(User) {finish_email_sign_up(User::TYPE_STUDENT, email, true)}
      refute PartialRegistration.in_progress? session

      created_user = User.find signed_in_user_id
      assert_equal User.hash_email(email), created_user.hashed_email

      assert_sign_up_tracking(
        SignUpTracking::NOT_IN_STUDY_GROUP,
        %w(
          load-sign-up-page
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
        user: {
          email: email,
          password: 'mypassword',
          password_confirmation: 'mypassword'
        }
      }
      assert PartialRegistration.in_progress? session

      assert_creates(User) {finish_email_sign_up(User::TYPE_TEACHER, email, true)}
      refute PartialRegistration.in_progress? session

      created_user = User.find signed_in_user_id
      assert_equal email, created_user.email

      assert_sign_up_tracking(
        SignUpTracking::NOT_IN_STUDY_GROUP,
        %w(
          load-sign-up-page
          begin-sign-up-success
          email-load-finish-sign-up-page
          email-sign-up-success
        )
      )
    ensure
      created_user&.destroy!
    end

    private def finish_email_sign_up(user_type, email, new_sign_up = false)
      params = finish_sign_up_params({user_type: user_type, email: email}, new_sign_up)
      post '/users', params: params
    end
  end
end
