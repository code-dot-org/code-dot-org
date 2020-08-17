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
      assert_redirected_to '/users/sign_up'
      follow_redirect!
      assert_template partial: '_finish_sign_up'
      assert PartialRegistration.in_progress? session

      assert_creates(User) {finish_email_sign_up(User::TYPE_STUDENT)}
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

    private

    def finish_email_sign_up(user_type)
      post '/users', params: finish_sign_up_params(user_type: user_type)
    end
  end
end
