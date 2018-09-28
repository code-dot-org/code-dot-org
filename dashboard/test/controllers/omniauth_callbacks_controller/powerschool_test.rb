require 'test_helper'
require_relative './utils'

module OmniauthCallbacksControllerTests
  #
  # Tests over Powerschool sign-up and sign-in stories
  #
  class PowerschoolTest < ActionDispatch::IntegrationTest
    include OmniauthCallbacksControllerTests::Utils

    setup do
      stub_firehose
    end

    test "student sign-up" do
      auth_hash = mock_oauth user_type: User::TYPE_STUDENT

      assert_creates(User) {sign_in_through_powerschool}
      assert_redirected_to '/'
      follow_redirect!
      assert_redirected_to '/home'
      assert_equal I18n.t('auth.signed_in'), flash[:notice]

      created_user = User.find signed_in_user_id
      assert_valid_student created_user
      assert_credentials auth_hash, created_user
    ensure
      created_user&.destroy!
    end

    test "teacher sign-up" do
      auth_hash = mock_oauth user_type: 'staff'

      assert_creates(User) {sign_in_through_powerschool}
      assert_redirected_to '/home'
      assert_equal I18n.t('auth.signed_in'), flash[:notice]

      created_user = User.find signed_in_user_id
      assert_valid_teacher created_user, expected_email: auth_hash.info.email
      assert_credentials auth_hash, created_user
    ensure
      created_user&.destroy!
    end

    test "student sign-in" do
      auth_hash = mock_oauth user_type: User::TYPE_STUDENT

      student = create(:student, :unmigrated_powerschool_sso, uid: auth_hash.uid)

      sign_in_through_powerschool
      assert_redirected_to '/'
      follow_redirect!
      assert_redirected_to '/home'
      assert_equal I18n.t('auth.signed_in'), flash[:notice]

      assert_equal student.id, signed_in_user_id
      student.reload
      assert_credentials auth_hash, student
    end

    test "teacher sign-in" do
      auth_hash = mock_oauth user_type: 'staff'

      teacher = create(:teacher, :unmigrated_powerschool_sso, uid: auth_hash.uid)

      sign_in_through_powerschool
      assert_redirected_to '/home'
      assert_equal I18n.t('auth.signed_in'), flash[:notice]

      assert_equal teacher.id, signed_in_user_id
      teacher.reload
      assert_credentials auth_hash, teacher
    end

    private

    def mock_oauth(user_type:)
      mock_oauth_for AuthenticationOption::POWERSCHOOL, generate_powerschool_auth_hash(user_type)
    end

    def generate_powerschool_auth_hash(user_type)
      user_type = 'staff' if user_type == User::TYPE_TEACHER
      OmniAuth::AuthHash.new(
        uid: SecureRandom.uuid,
        provider: AuthenticationOption::POWERSCHOOL,
        info: {
          name: nil,
        },
        extra: {
          response: {
            message: {
              args: {
                '["http://openid.net/srv/ax/1.0", "value.ext0"]': user_type,
                '["http://openid.net/srv/ax/1.0", "value.ext1"]': 'test_email@example.com',
                '["http://openid.net/srv/ax/1.0", "value.ext2"]': 'firstname',
                '["http://openid.net/srv/ax/1.0", "value.ext3"]': 'lastname',
              }
            }
          }
        }
      )
    end

    # The user signs in through Powerschool, which hits the oauth callback
    # and redirects to something else: homepage, finish_sign_up, etc.
    def sign_in_through_powerschool
      sign_in_through AuthenticationOption::POWERSCHOOL
    end
  end
end
