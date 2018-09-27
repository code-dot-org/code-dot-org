require 'test_helper'
require_relative './utils'

module OmniauthCallbacksControllerTests
  #
  # Tests over Clever sign-up and sign-in stories
  #
  class CleverTest < ActionDispatch::IntegrationTest
    include OmniauthCallbacksControllerTests::Utils

    setup do
      # Skip firehose logging for these tests, unless explicitly requested
      FirehoseClient.instance.stubs(:put_record)

      # Force split-test to control group (override in tests over experiment)
      SignUpTracking.stubs(:split_test_percentage).returns(0)
    end

    test "student sign-up" do
      mock_oauth user_type: User::TYPE_STUDENT

      assert_creates(User) {sign_in_through_clever}
      assert_redirected_to '/'
      follow_redirect!
      assert_redirected_to '/home'
      assert_equal I18n.t('auth.signed_in'), flash[:notice]

      created_user = User.find signed_in_user_id
      assert_valid_student created_user
      assert_credentials @auth_hash, created_user
    ensure
      created_user&.destroy!
    end

    test "teacher sign-up" do
      mock_oauth user_type: User::TYPE_TEACHER

      assert_creates(User) {sign_in_through_clever}
      assert_redirected_to '/home'
      assert_equal I18n.t('auth.signed_in'), flash[:notice]

      created_user = User.find signed_in_user_id
      assert_valid_teacher created_user, expected_email: @auth_hash.info.email
      assert_credentials @auth_hash, created_user
    ensure
      created_user&.destroy!
    end

    test "student sign-up (new sign-up flow)" do
      mock_oauth user_type: User::TYPE_STUDENT
      SignUpTracking.stubs(:split_test_percentage).returns(100)

      sign_in_through_clever
      assert_redirected_to '/users/sign_up'
      follow_redirect!
      assert_template partial: '_finish_sign_up'

      assert_creates(User) {finish_sign_up User::TYPE_STUDENT}
      assert_redirected_to '/'
      follow_redirect!
      assert_redirected_to '/home'
      assert_equal I18n.t('devise.registrations.signed_up'), flash[:notice]

      created_user = User.find signed_in_user_id
      assert_valid_student created_user
      assert_credentials @auth_hash, created_user
    ensure
      created_user&.destroy!
    end

    test "teacher sign-up (new sign-up flow)" do
      mock_oauth user_type: User::TYPE_TEACHER
      SignUpTracking.stubs(:split_test_percentage).returns(100)

      sign_in_through_clever
      assert_redirected_to '/users/sign_up'
      follow_redirect!
      assert_template partial: '_finish_sign_up'

      assert_creates(User) {finish_sign_up User::TYPE_TEACHER}
      assert_redirected_to '/home'
      assert_equal I18n.t('devise.registrations.signed_up'), flash[:notice]

      created_user = User.find signed_in_user_id
      assert_valid_teacher created_user, expected_email: @auth_hash.info.email
      assert_credentials @auth_hash, created_user
    ensure
      created_user&.destroy!
    end

    test "student sign-in" do
      mock_oauth user_type: User::TYPE_STUDENT

      student = create(:student, :unmigrated_clever_sso, uid: @auth_hash.uid)

      sign_in_through_clever
      assert_redirected_to '/'
      follow_redirect!
      assert_redirected_to '/home'
      assert_equal I18n.t('auth.signed_in'), flash[:notice]

      assert_equal student.id, signed_in_user_id
      student.reload
      assert_credentials @auth_hash, student
    end

    test "teacher sign-in" do
      mock_oauth user_type: User::TYPE_TEACHER

      teacher = create(:teacher, :unmigrated_clever_sso, uid: @auth_hash.uid)

      sign_in_through_clever
      assert_redirected_to '/home'
      assert_equal I18n.t('auth.signed_in'), flash[:notice]

      assert_equal teacher.id, signed_in_user_id
      teacher.reload
      assert_credentials @auth_hash, teacher
    end

    private

    def mock_oauth(override_params = {})
      mock_oauth_for AuthenticationOption::CLEVER, generate_auth_hash(override_params)
    end

    def generate_auth_hash(override_params = {})
      OmniAuth::AuthHash.new(
        uid: override_params[:uid] || '1111',
        provider: override_params[:provider] || AuthenticationOption::CLEVER,
        info: {
          name: override_params[:name] || 'someone',
          email: override_params[:email] || 'auth_test@code.org',
          user_type: override_params[:user_type].presence,
          dob: override_params[:dob] || Date.today - 20.years,
          gender: override_params[:gender] || 'f'
        },
        credentials: {
          token: override_params[:token] || 'fake-token',
          expires_at: override_params[:expires_at] || 'fake-token-expiration'
        }
      )
    end

    # The user signs in through Clever, which hits the oauth callback
    # and redirects to something else: homepage, finish_sign_up, etc.
    def sign_in_through_clever
      sign_in_through AuthenticationOption::CLEVER
    end
  end
end
