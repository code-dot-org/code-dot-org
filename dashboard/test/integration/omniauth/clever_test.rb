require 'test_helper'
require_relative './utils'

module OmniauthCallbacksControllerTests
  #
  # Tests over Clever sign-up and sign-in stories
  #
  class CleverTest < ActionDispatch::IntegrationTest
    include OmniauthCallbacksControllerTests::Utils

    setup do
      stub_firehose

      # Force split-test on
      # Even with split test on, Clever should use old sign-up flow
      SignUpTracking.stubs(:split_test_percentage).returns(100)
    end

    test "student sign-up" do
      auth_hash = mock_oauth user_type: User::TYPE_STUDENT

      assert_creates(User) {sign_in_through_clever}
      assert_redirected_to '/'
      follow_redirect!
      assert_redirected_to '/home'
      assert_equal I18n.t('auth.signed_in'), flash[:notice]

      created_user = User.find signed_in_user_id
      assert_valid_student created_user
      assert_credentials auth_hash, created_user

      assert_sign_up_tracking(
        SignUpTracking::NOT_IN_STUDY_GROUP,
        %w(
          clever-callback
          clever-sign-up-success
        )
      )
    ensure
      created_user&.destroy!
    end

    test "teacher sign-up" do
      auth_hash = mock_oauth user_type: User::TYPE_TEACHER

      assert_creates(User) {sign_in_through_clever}
      assert_redirected_to '/home'
      assert_equal I18n.t('auth.signed_in'), flash[:notice]

      created_user = User.find signed_in_user_id
      assert_valid_teacher created_user, expected_email: auth_hash.info.email
      assert_credentials auth_hash, created_user

      assert_sign_up_tracking(
        SignUpTracking::NOT_IN_STUDY_GROUP,
        %w(
          clever-callback
          clever-sign-up-success
        )
      )
    ensure
      created_user&.destroy!
    end

    test "student sign-in" do
      auth_hash = mock_oauth user_type: User::TYPE_STUDENT

      student = create(:student, :clever_sso_provider, uid: auth_hash.uid)

      sign_in_through_clever
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
      auth_hash = mock_oauth user_type: User::TYPE_TEACHER

      teacher = create(:teacher, :clever_sso_provider, uid: auth_hash.uid)

      sign_in_through_clever
      assert_redirected_to '/home'
      assert_equal I18n.t('auth.signed_in'), flash[:notice]

      assert_equal teacher.id, signed_in_user_id
      teacher.reload
      assert_credentials auth_hash, teacher

      refute_sign_up_tracking
    end

    test 'user_type queryparam has no effect on Clever sign-up' do
      # This shouldn't be common, because we don't link to Clever from
      # our sign-up page. But there's no reason someone couldn't hit
      # these routes in this order, so this test ensures we respect
      # Clever's user types.

      # Clever says this account is a STUDENT
      mock_oauth user_type: User::TYPE_STUDENT

      # User visits a page that sets the sign-up type to TEACHER
      get '/users/sign_up?user[user_type]=teacher'

      # User signs in with their student clever account
      assert_creates(User) {sign_in_through_clever}
      follow_redirect!

      # Ensure we created a student
      created_user = User.find signed_in_user_id
      assert_valid_student created_user
    ensure
      created_user&.destroy!
    end

    private

    def mock_oauth(override_params = {})
      mock_oauth_for AuthenticationOption::CLEVER, generate_auth_hash(
        {
          provider: AuthenticationOption::CLEVER
        }.merge(override_params)
      )
    end

    # The user signs in through Clever, which hits the oauth callback
    # and redirects to something else: homepage, finish_sign_up, etc.
    def sign_in_through_clever
      sign_in_through AuthenticationOption::CLEVER
    end
  end
end
