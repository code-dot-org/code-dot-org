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
    end

    test "student sign-up" do
      auth_hash = mock_oauth user_type: User::TYPE_STUDENT

      # Initiate Clever OAuth and hit the callback, which will render the omniauth redirect
      # template, but does not save the user to the db.
      post user_clever_omniauth_authorize_path
      assert_does_not_create(User) do
        get user_clever_omniauth_callback_path
      end
      assert_response :success
      assert_template 'omniauth/redirect'
      assert PartialRegistration.in_progress? session

      # Simulate submitting the finish signup page form, which actually creates the user.
      assert_creates(User) {finish_sign_up auth_hash, User::TYPE_STUDENT}
      refute PartialRegistration.in_progress? session

      created_user = User.find signed_in_user_id
      assert created_user.valid?
      assert created_user.student?
      assert_credentials auth_hash, created_user
    ensure
      created_user&.destroy!
    end

    test "teacher sign-up" do
      auth_hash = mock_oauth user_type: User::TYPE_TEACHER

      # Initiate Clever OAuth and hit the callback, which will render the omniauth redirect
      # template, but does not save the user to the db.
      post user_clever_omniauth_authorize_path
      assert_does_not_create(User) do
        get user_clever_omniauth_callback_path
      end
      assert_response :success
      assert_template 'omniauth/redirect'
      assert PartialRegistration.in_progress? session

      # Simulate submitting the finish signup page form, which actually creates the user.
      assert_creates(User) {finish_sign_up auth_hash, User::TYPE_TEACHER}
      refute PartialRegistration.in_progress? session

      created_user = User.find signed_in_user_id
      assert_valid_teacher created_user, expected_email: auth_hash.info.email
      assert_credentials auth_hash, created_user
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
    end

    private def mock_oauth(override_params = {})
      mock_oauth_for AuthenticationOption::CLEVER, generate_auth_hash(
        {
          provider: AuthenticationOption::CLEVER
        }.merge(override_params)
      )
    end

    # The user signs in through Clever, which hits the oauth callback
    # and redirects to something else: homepage, finish_teacher_account, etc.
    private def sign_in_through_clever
      sign_in_through AuthenticationOption::CLEVER
    end
  end
end
