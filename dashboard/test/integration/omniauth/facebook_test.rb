require 'test_helper'
require_relative './utils'

module OmniauthCallbacksControllerTests
  #
  # Tests over Facebook sign-up and sign-in stories
  #
  class FacebookTest < ActionDispatch::IntegrationTest
    include OmniauthCallbacksControllerTests::Utils

    test "student sign-up" do
      auth_hash = mock_oauth

      get '/users/sign_up'
      sign_in_through_facebook
      assert_redirected_to '/users/sign_up'
      follow_redirect!
      assert_template partial: '_finish_sign_up'

      assert_creates(User) {finish_sign_up auth_hash, User::TYPE_STUDENT}
      assert_redirected_to '/'
      follow_redirect!
      assert_redirected_to '/home'
      assert_equal I18n.t('devise.registrations.signed_up'), flash[:notice]

      created_user = User.find signed_in_user_id
      assert_valid_student created_user, expected_email: auth_hash.info.email
      assert_credentials auth_hash, created_user
    ensure
      created_user&.destroy!
    end

    test "teacher sign-up" do
      auth_hash = mock_oauth

      get '/users/sign_up'
      sign_in_through_facebook
      assert_redirected_to '/users/sign_up'
      follow_redirect!
      assert_template partial: '_finish_sign_up'

      assert_creates(User) {finish_sign_up auth_hash, User::TYPE_TEACHER}
      assert_redirected_to '/home'
      assert_equal I18n.t('devise.registrations.signed_up'), flash[:notice]

      created_user = User.find signed_in_user_id
      assert_valid_teacher created_user, expected_email: auth_hash.info.email
      assert_credentials auth_hash, created_user
    ensure
      created_user&.destroy!
    end

    test "student sign-in" do
      auth_hash = mock_oauth

      student = create(:student, :facebook_sso_provider, uid: auth_hash.uid)

      get '/users/sign_in'
      sign_in_through_facebook
      assert_redirected_to '/'
      follow_redirect!
      assert_redirected_to '/home'
      assert_equal I18n.t('auth.signed_in'), flash[:notice]

      assert_equal student.id, signed_in_user_id
      student.reload
      assert_credentials auth_hash, student
    end

    test "teacher sign-in" do
      auth_hash = mock_oauth

      teacher = create(:teacher, :facebook_sso_provider, uid: auth_hash.uid)

      get '/users/sign_in'
      sign_in_through_facebook
      assert_redirected_to '/home'
      assert_equal I18n.t('auth.signed_in'), flash[:notice]

      assert_equal teacher.id, signed_in_user_id
      teacher.reload
      assert_credentials auth_hash, teacher
    end

    private

    def mock_oauth
      mock_oauth_for AuthenticationOption::FACEBOOK, generate_auth_hash(
        provider: AuthenticationOption::FACEBOOK
      )
    end

    # The user signs in through Facebook, which hits the oauth callback
    # and redirects to something else: homepage, finish_sign_up, etc.
    def sign_in_through_facebook
      sign_in_through AuthenticationOption::FACEBOOK
    end
  end
end
