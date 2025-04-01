require 'test_helper'
require_relative './utils'

module OmniauthCallbacksControllerTests
  #
  # Tests over Google sign-up and sign-in stories
  #
  class GoogleOAuth2Test < ActionDispatch::IntegrationTest
    include OmniauthCallbacksControllerTests::Utils

    setup do
      stub_firehose
    end

    test "student sign up for newest sign up flow" do
      auth_hash = mock_oauth

      post "/users/auth/google_oauth2"
      get '/users/auth/google_oauth2/callback', params: {finish_url: '/users/sign_up/finish_student_account'}
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

      post "/users/auth/google_oauth2"
      get '/users/auth/google_oauth2/callback', params: {finish_url: '/users/sign_up/finish_teacher_account'}
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

    test "student cancel in-progress registration" do
      mock_oauth

      assert_does_not_create(User) do
        post "/users/auth/google_oauth2"
        get '/users/auth/google_oauth2/callback', params: {finish_url: '/users/sign_up/finish_student_account'}
        assert_template 'omniauth/redirect'
        assert PartialRegistration.in_progress? session

        PartialRegistration.expects(:delete)

        get '/users/cancel'
        assert_redirected_to new_user_registration_path
      end
    end

    test "teacher cancel in-progress registration" do
      mock_oauth

      assert_does_not_create(User) do
        post "/users/auth/google_oauth2"
        get '/users/auth/google_oauth2/callback', params: {finish_url: '/users/sign_up/finish_teacher_account'}
        assert_template 'omniauth/redirect'
        assert PartialRegistration.in_progress? session

        PartialRegistration.expects(:delete)

        get '/users/cancel'
        assert_redirected_to new_user_registration_path
      end
    end

    test "student sign-in" do
      auth_hash = mock_oauth

      student = create(:student, :google_sso_provider, uid: auth_hash.uid)

      get '/users/sign_in'
      sign_in_through_google
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

      teacher = create(:teacher, :google_sso_provider, uid: auth_hash.uid)

      get '/users/sign_in'
      sign_in_through_google
      assert_redirected_to '/home'
      assert_equal I18n.t('auth.signed_in'), flash[:notice]

      assert_equal teacher.id, signed_in_user_id
      teacher.reload
      assert_credentials auth_hash, teacher
    end

    test "sign-in from sign-up page" do
      auth_hash = mock_oauth

      teacher = create(:teacher, :google_sso_provider, uid: auth_hash.uid)

      get '/users/sign_up'
      refute_creates(User) {sign_in_through_google}
      assert_redirected_to '/home'
      assert_equal I18n.t('auth.signed_in'), flash[:notice]

      assert_equal teacher.id, signed_in_user_id
    end

    # @return [OmniAuth::AuthHash] that will be passed to the callback when test-mode OAuth is invoked
    private def mock_oauth
      mock_oauth_for AuthenticationOption::GOOGLE, generate_auth_hash(
        provider: AuthenticationOption::GOOGLE,
        refresh_token: 'fake-refresh-token'
      )
    end
  end
end
