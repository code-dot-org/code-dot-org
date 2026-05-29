require 'test_helper'
require_relative './utils'

module OmniauthCallbacksControllerTests
  class ClasslinkTest < ActionDispatch::IntegrationTest
    include OmniauthCallbacksControllerTests::Utils

    setup do
      stub_firehose
    end

    test "teacher sign-up" do
      auth_hash = mock_oauth

      post user_classlink_omniauth_authorize_path
      assert_does_not_create(User) do
        get user_classlink_omniauth_callback_path
      end
      assert_response :success
      assert_template 'omniauth/redirect'
      assert PartialRegistration.in_progress? session

      assert_creates(User) {finish_sign_up auth_hash, User::TYPE_TEACHER}
      refute PartialRegistration.in_progress? session

      created_user = User.find signed_in_user_id
      assert_valid_teacher created_user, expected_email: 'auth_test@code.org'
      assert created_user.verified_teacher?
      assert_equal 1, created_user.permissions.where(permission: UserPermission::AUTHORIZED_TEACHER).count
      assert_credentials auth_hash, created_user
    ensure
      created_user&.destroy!
    end

    test "student sign-up does not auto-verify" do
      auth_hash = mock_oauth role: 'Student'

      post user_classlink_omniauth_authorize_path
      assert_does_not_create(User) do
        get user_classlink_omniauth_callback_path
      end
      assert_response :success
      assert_template 'omniauth/redirect'
      assert PartialRegistration.in_progress? session

      assert_creates(User) {finish_sign_up auth_hash, User::TYPE_STUDENT}
      refute PartialRegistration.in_progress? session

      created_user = User.find signed_in_user_id
      assert_valid_student created_user, expected_email: 'auth_test@code.org'
      refute created_user.verified_teacher?
      assert_credentials auth_hash, created_user
    ensure
      created_user&.destroy!
    end

    test "teacher sign-in" do
      auth_hash = mock_oauth

      teacher = create(:teacher, :classlink_sso_provider, uid: auth_hash.uid)

      sign_in_through_classlink
      assert_redirected_to '/home'
      assert_equal I18n.t('auth.signed_in'), flash[:notice]

      assert_equal teacher.id, signed_in_user_id
      teacher.reload
      assert teacher.verified_teacher?
      assert_credentials auth_hash, teacher
    end

    test "student sign-in does not auto-verify" do
      auth_hash = mock_oauth role: 'Student'

      student = create(:student, :classlink_sso_provider, uid: auth_hash.uid)

      sign_in_through_classlink
      assert_redirected_to '/'
      follow_redirect!
      assert_redirected_to '/home'
      assert_equal I18n.t('auth.signed_in'), flash[:notice]

      assert_equal student.id, signed_in_user_id
      student.reload
      refute student.verified_teacher?
      assert_credentials auth_hash, student
    end

    private def mock_oauth(role: 'Teacher')
      auth_hash = generate_auth_hash(
        provider: AuthenticationOption::CLASSLINK,
        user_type: nil,
        email: "#{role.downcase}@school.test"
      )
      auth_hash.extra = OmniAuth::AuthHash.new(
        raw_info: {
          email: auth_hash.info.email,
          display_name: 'Teacher Test',
          first_name: 'Teacher',
          last_name: 'Test',
          role: role,
          state_name: 'New Jersey',
        }
      )

      mock_oauth_for AuthenticationOption::CLASSLINK, auth_hash
    end

    private def sign_in_through_classlink
      sign_in_through AuthenticationOption::CLASSLINK
    end
  end
end
