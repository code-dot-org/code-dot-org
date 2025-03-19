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
    end

    test "student in new sign-up" do
      email = "student@example.com"

      post '/users/begin_sign_up', params: {
        user: {
          email: email,
          password: 'mypassword',
          password_confirmation: 'mypassword'
        }
      }
      assert PartialRegistration.in_progress? session

      assert_creates(User) {finish_email_sign_up(User::TYPE_STUDENT, email)}
      refute PartialRegistration.in_progress? session

      created_user = User.find signed_in_user_id
      assert_equal User.hash_email(email), created_user.hashed_email
    ensure
      created_user&.destroy!
    end

    test "teacher in new sign-up" do
      email = "teacher@example.com"

      post '/users/begin_sign_up', params: {
        user: {
          email: email,
          password: 'mypassword',
          password_confirmation: 'mypassword'
        }
      }
      assert PartialRegistration.in_progress? session

      assert_creates(User) {finish_email_sign_up(User::TYPE_TEACHER, email)}
      refute PartialRegistration.in_progress? session

      created_user = User.find signed_in_user_id
      assert_equal email, created_user.email
    ensure
      created_user&.destroy!
    end

    private def finish_email_sign_up(user_type, email)
      params = finish_sign_up_params({user_type: user_type, email: email})
      post '/users', params: params
    end
  end
end
