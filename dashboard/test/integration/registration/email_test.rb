require 'test_helper'
require_relative '../omniauth/utils'

module RegistrationsControllerTests
  #
  # Tests full integration of email signup
  #
  class EmailTest < ActionDispatch::IntegrationTest
    include OmniauthCallbacksControllerTests::Utils

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

      assert_creates(User) {finish_email_sign_up(User::TYPE_STUDENT)}
      assert_redirected_to '/'
      follow_redirect!
      assert_redirected_to '/home'
      assert_equal I18n.t('devise.registrations.signed_up'), flash[:notice]

      created_user = User.find signed_in_user_id
      assert_equal User.hash_email(email), created_user.hashed_email
    ensure
      created_user&.destroy!
    end

    private

    def finish_email_sign_up(user_type)
      post '/users', params: finish_sign_up_params(user_type: user_type)
    end
  end
end
