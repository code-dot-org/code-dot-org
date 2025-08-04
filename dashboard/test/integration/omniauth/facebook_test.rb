require 'test_helper'
require_relative './utils'

module OmniauthCallbacksControllerTests
  #
  # Tests over Facebook sign-up and sign-in stories
  #
  class FacebookTest < ActionDispatch::IntegrationTest
    include OmniauthCallbacksControllerTests::Utils

    setup do
      stub_firehose
    end

    test "student sign up for newest sign up flow" do
      auth_hash = mock_oauth

      post "/users/auth/facebook"
      get '/users/auth/facebook/callback', params: {finish_url: '/users/sign_up/finish_student_account'}
      assert_template 'omniauth/redirect'
      assert PartialRegistration.in_progress? session

      assert_creates(User) {finish_sign_up auth_hash, User::TYPE_STUDENT}
      refute PartialRegistration.in_progress? session

      created_user = User.find signed_in_user_id
      assert_valid_student created_user, expected_email: auth_hash.info.email
      assert_credentials auth_hash, created_user
    ensure
      created_user&.destroy!
    end

    test "teacher sign up for newest sign up flow" do
      auth_hash = mock_oauth

      post "/users/auth/facebook"
      get '/users/auth/facebook/callback', params: {finish_url: '/users/sign_up/finish_teacher_account'}
      assert_template 'omniauth/redirect'
      assert PartialRegistration.in_progress? session

      assert_creates(User) {finish_sign_up auth_hash, User::TYPE_TEACHER}
      refute PartialRegistration.in_progress? session

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

    private def mock_oauth
      mock_oauth_for AuthenticationOption::FACEBOOK, generate_auth_hash(
        provider: AuthenticationOption::FACEBOOK
      )
    end

    # The user signs in through Facebook, which hits the oauth callback
    # and redirects to something else: homepage, finish_teacher_account, etc.
    private def sign_in_through_facebook
      sign_in_through AuthenticationOption::FACEBOOK
    end
  end
end
