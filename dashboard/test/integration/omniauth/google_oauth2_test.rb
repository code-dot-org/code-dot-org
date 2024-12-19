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

      # Force split-test to control group (override in tests over experiment)
      SignUpTracking.stubs(:split_test_percentage).returns(0)
    end

    test "student sign up for newest sign up flow" do
      auth_hash = mock_oauth

      post "/users/auth/google_oauth2"
      get '/users/auth/google_oauth2/callback', params: {finish_url: '/users/new_sign_up/finish_student_account'}
      assert_template 'omniauth/redirect'
      assert PartialRegistration.in_progress? session

      assert_creates(User) {finish_sign_up auth_hash, User::TYPE_STUDENT, true}
      refute PartialRegistration.in_progress? session

      created_user = User.find signed_in_user_id
      assert_valid_student created_user, expected_email: auth_hash.info.email
      assert_credentials auth_hash, created_user

      assert_sign_up_tracking(
        SignUpTracking::CONTROL_GROUP,
        %w(
          google_oauth2-callback
          google_oauth2-load-finish-sign-up-page
          google_oauth2-sign-up-success
        )
      )
    ensure
      created_user&.destroy!
    end

    test "teacher sign up for newest sign up flow" do
      auth_hash = mock_oauth

      post "/users/auth/google_oauth2"
      get '/users/auth/google_oauth2/callback', params: {finish_url: '/users/new_sign_up/finish_teacher_account'}
      assert_template 'omniauth/redirect'
      assert PartialRegistration.in_progress? session

      assert_creates(User) {finish_sign_up auth_hash, User::TYPE_TEACHER, true}
      refute PartialRegistration.in_progress? session

      created_user = User.find signed_in_user_id
      assert_valid_teacher created_user, expected_email: auth_hash.info.email
      assert_credentials auth_hash, created_user

      assert_sign_up_tracking(
        SignUpTracking::CONTROL_GROUP,
        %w(
          google_oauth2-callback
          google_oauth2-load-finish-sign-up-page
          google_oauth2-sign-up-success
        )
      )
    ensure
      created_user&.destroy!
    end

    ### TODO: Write sign up failure and cancel scenario tests for new sign up flow if applicable ACQ-2871

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

      refute_sign_up_tracking
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

      refute_sign_up_tracking
    end

    ### TODO: Create an equivalent test for this in new sign up flow ACQ-2871
    # test "sign-in from sign-up page" do
    #   auth_hash = mock_oauth

    #   teacher = create(:teacher, :google_sso_provider, uid: auth_hash.uid)

    #   get '/users/sign_up'
    #   refute_creates(User) {sign_in_through_google}
    #   assert_redirected_to '/home'
    #   assert_equal I18n.t('auth.signed_in'), flash[:notice]

    #   assert_equal teacher.id, signed_in_user_id

    #   assert_sign_up_tracking(
    #     SignUpTracking::CONTROL_GROUP,
    #     %w(
    #       load-sign-up-page
    #       google_oauth2-callback
    #       google_oauth2-sign-in
    #     )
    #   )
    # end

    test 'user_type is usually unset on finish_sign_up' do
      mock_oauth

      get '/users/sign_up'
      sign_in_through_google
      omniauth_redirect
      assert_nil assigns(:user).user_type
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
