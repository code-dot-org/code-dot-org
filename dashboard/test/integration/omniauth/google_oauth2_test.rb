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

    test "student sign-up" do
      auth_hash = mock_oauth

      get '/users/sign_up'
      sign_in_through_google
      assert_redirected_to '/users/sign_up'
      follow_redirect!
      assert_template partial: '_finish_sign_up'
      assert PartialRegistration.in_progress? session

      assert_creates(User) {finish_sign_up auth_hash, User::TYPE_STUDENT}
      assert_redirected_to '/'
      follow_redirect!
      assert_redirected_to '/home'
      assert_equal I18n.t('devise.registrations.signed_up'), flash[:notice]
      refute PartialRegistration.in_progress? session

      created_user = User.find signed_in_user_id
      assert_valid_student created_user, expected_email: auth_hash.info.email
      assert_credentials auth_hash, created_user

      assert_sign_up_tracking(
        SignUpTracking::CONTROL_GROUP,
        %w(
          load-sign-up-page
          google_oauth2-callback
          google_oauth2-load-finish-sign-up-page
          google_oauth2-sign-up-success
        )
      )
    ensure
      created_user&.destroy!
    end

    test "teacher sign-up" do
      auth_hash = mock_oauth

      get '/users/sign_up'
      sign_in_through_google
      assert_redirected_to '/users/sign_up'
      follow_redirect!
      assert_template partial: '_finish_sign_up'
      assert PartialRegistration.in_progress? session

      assert_creates(User) {finish_sign_up auth_hash, User::TYPE_TEACHER}
      assert_redirected_to '/home'
      assert_equal I18n.t('devise.registrations.signed_up'), flash[:notice]
      refute PartialRegistration.in_progress? session

      created_user = User.find signed_in_user_id
      assert_valid_teacher created_user, expected_email: auth_hash.info.email
      assert_credentials auth_hash, created_user

      assert_sign_up_tracking(
        SignUpTracking::CONTROL_GROUP,
        %w(
          load-sign-up-page
          google_oauth2-callback
          google_oauth2-load-finish-sign-up-page
          google_oauth2-sign-up-success
        )
      )
    ensure
      created_user&.destroy!
    end

    test "fail to finish sign-up" do
      auth_hash = mock_oauth

      get '/users/sign_up'
      sign_in_through_google
      assert_redirected_to '/users/sign_up'
      follow_redirect!
      assert_template partial: '_finish_sign_up'
      assert PartialRegistration.in_progress? session

      refute_creates(User) {fail_sign_up auth_hash, User::TYPE_TEACHER}
      assert_response :success
      assert_template partial: '_finish_sign_up'
      assert PartialRegistration.in_progress? session

      # Let's try that one more time...
      refute_creates(User) {fail_sign_up auth_hash, User::TYPE_TEACHER}
      assert_response :success
      assert_template partial: '_finish_sign_up'
      assert PartialRegistration.in_progress? session

      assert_sign_up_tracking(
        SignUpTracking::CONTROL_GROUP,
        %w(
          load-sign-up-page
          google_oauth2-callback
          google_oauth2-load-finish-sign-up-page
          google_oauth2-load-finish-sign-up-page
          google_oauth2-sign-up-error
          google_oauth2-load-finish-sign-up-page
          google_oauth2-sign-up-error
        )
      )
    end

    test "student sign-up (new sign-up flow)" do
      auth_hash = mock_oauth
      SignUpTracking.stubs(:split_test_percentage).returns(100)

      get '/users/sign_up'
      sign_in_through_google
      assert_redirected_to '/users/sign_up'
      follow_redirect!
      assert_response :success
      assert_template partial: '_finish_sign_up'
      assert PartialRegistration.in_progress? session

      assert_creates(User) {finish_sign_up auth_hash, User::TYPE_STUDENT}
      assert_redirected_to '/'
      follow_redirect!
      assert_redirected_to '/home'
      assert_equal I18n.t('devise.registrations.signed_up'), flash[:notice]
      refute PartialRegistration.in_progress? session

      created_user = User.find signed_in_user_id
      assert_valid_student created_user, expected_email: auth_hash.info.email
      assert_credentials auth_hash, created_user

      assert_sign_up_tracking(
        SignUpTracking::NEW_SIGN_UP_GROUP,
        %w(
          load-new-sign-up-page
          google_oauth2-callback
          google_oauth2-load-finish-sign-up-page
          google_oauth2-sign-up-success
        )
      )
    ensure
      created_user&.destroy!
    end

    test "teacher sign-up (new sign-up flow)" do
      auth_hash = mock_oauth
      SignUpTracking.stubs(:split_test_percentage).returns(100)

      get '/users/sign_up'
      sign_in_through_google
      assert_redirected_to '/users/sign_up'
      follow_redirect!
      assert_template partial: '_finish_sign_up'
      assert PartialRegistration.in_progress? session

      assert_creates(User) {finish_sign_up auth_hash, User::TYPE_TEACHER}
      assert_redirected_to '/home'
      assert_equal I18n.t('devise.registrations.signed_up'), flash[:notice]
      refute PartialRegistration.in_progress? session

      created_user = User.find signed_in_user_id
      assert_valid_teacher created_user, expected_email: auth_hash.info.email
      assert_credentials auth_hash, created_user

      assert_sign_up_tracking(
        SignUpTracking::NEW_SIGN_UP_GROUP,
        %w(
          load-new-sign-up-page
          google_oauth2-callback
          google_oauth2-load-finish-sign-up-page
          google_oauth2-sign-up-success
        )
      )
    ensure
      created_user&.destroy!
    end

    test "cancel sign-up (new sign-up flow)" do
      mock_oauth
      SignUpTracking.stubs(:split_test_percentage).returns(100)

      get '/users/sign_up'
      sign_in_through_google
      assert_redirected_to '/users/sign_up'
      follow_redirect!
      assert_template partial: '_finish_sign_up'
      assert PartialRegistration.in_progress? session

      get '/users/cancel'

      assert_redirected_to '/users/sign_up'
      assert_sign_up_tracking(
        SignUpTracking::NEW_SIGN_UP_GROUP,
        %w(
          load-new-sign-up-page
          google_oauth2-callback
          google_oauth2-load-finish-sign-up-page
          google_oauth2-cancel-finish-sign-up
        )
      )
      refute PartialRegistration.in_progress? session
    end

    test "fail to finish sign-up (new sign-up flow)" do
      auth_hash = mock_oauth
      SignUpTracking.stubs(:split_test_percentage).returns(100)

      get '/users/sign_up'
      sign_in_through_google
      assert_redirected_to '/users/sign_up'
      follow_redirect!
      assert_template partial: '_finish_sign_up'
      assert PartialRegistration.in_progress? session

      refute_creates(User) {fail_sign_up auth_hash, User::TYPE_TEACHER}
      assert_response :success
      assert_template partial: '_finish_sign_up'
      assert PartialRegistration.in_progress? session

      # Let's try that one more time...
      refute_creates(User) {fail_sign_up auth_hash, User::TYPE_TEACHER}
      assert_response :success
      assert_template partial: '_finish_sign_up'
      assert PartialRegistration.in_progress? session

      assert_sign_up_tracking(
        SignUpTracking::NEW_SIGN_UP_GROUP,
        %w(
          load-new-sign-up-page
          google_oauth2-callback
          google_oauth2-load-finish-sign-up-page
          google_oauth2-load-finish-sign-up-page
          google_oauth2-sign-up-error
          google_oauth2-load-finish-sign-up-page
          google_oauth2-sign-up-error
        )
      )
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

    test "sign-in from sign-up page" do
      auth_hash = mock_oauth

      teacher = create(:teacher, :google_sso_provider, uid: auth_hash.uid)

      get '/users/sign_up'
      refute_creates(User) {sign_in_through_google}
      assert_redirected_to '/home'
      assert_equal I18n.t('auth.signed_in'), flash[:notice]

      assert_equal teacher.id, signed_in_user_id

      assert_sign_up_tracking(
        SignUpTracking::CONTROL_GROUP,
        %w(
          load-sign-up-page
          google_oauth2-callback
          google_oauth2-sign-in
        )
      )
    end

    test 'user_type is usually unset on finish_sign_up' do
      mock_oauth

      get '/users/sign_up'
      sign_in_through_google
      follow_redirect!

      assert_template partial: '_finish_sign_up'
      assert_nil assigns(:user).user_type
    end

    test 'sign_up queryparam can prefill user_type on finish_sign_up' do
      mock_oauth

      get '/users/sign_up?user[user_type]=teacher'
      sign_in_through_google
      follow_redirect!

      assert_template partial: '_finish_sign_up'
      assert_equal 'teacher', assigns(:user).user_type
    end

    private

    # @return [OmniAuth::AuthHash] that will be passed to the callback when test-mode OAuth is invoked
    def mock_oauth
      mock_oauth_for AuthenticationOption::GOOGLE, generate_auth_hash(
        provider: AuthenticationOption::GOOGLE,
        refresh_token: 'fake-refresh-token'
      )
    end

    # The user signs in through Google, which hits the oauth callback
    # and redirects to something else: homepage, finish_sign_up, etc.
    def sign_in_through_google
      sign_in_through AuthenticationOption::GOOGLE
    end
  end
end
