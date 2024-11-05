require 'test_helper'

class Services::PartialRegistration::UserBuilderTest < ActiveSupport::TestCase
  TEST_USER_EMAIL = 'fake_user@email.org'
  TEST_IP = '1.2.3.4'

  after do
    PartialRegistration.delete @request.session

    test_user_to_delete = User.find_by_email_or_hashed_email(TEST_USER_EMAIL)
    test_user_to_delete&.destroy
  end

  def user_params(override_params = {})
    default_params = {
      user_type: override_params[:user_type] || 'student',
      email: TEST_USER_EMAIL,
      hashed_email: TEST_USER_EMAIL,
      name: 'Fake User',
      country_code: 'US',
      terms_of_service_version: ::User::TERMS_OF_SERVICE_VERSIONS.last
    }

    if default_params[:user_type] == 'student'
      default_params[:age] = '10'
      default_params[:gender] = 'Female'
      default_params[:us_state] = 'WA'
    else
      default_params[:email_preference_opt_in] = false
      default_params[:school_info_attributes] = {
        schoolId: nil,
        schoolName: nil,
        schoolType: nil,
        schoolZip: nil,
        schoolState: nil,
        country: nil,
        fullAddress: nil
      }
    end

    default_params.merge(override_params)
  end

  def setup_partial_user(override_params = {})
    env = Rack::MockRequest.env_for("test-env", 'HTTP_X_FORWARDED_FOR' => TEST_IP, :params => {user: user_params(override_params)})
    @request = ActionDispatch::Request.new env

    partial_user = User.new({email: TEST_USER_EMAIL, password: 'fake-pass', password_confirmation: 'fake-pass'})
    partial_user.validate_for_finish_sign_up
    PartialRegistration.persist_attributes(@request.session, partial_user)
  end

  # Student tests
  test 'builds student user with default values' do
    setup_partial_user

    assert_creates(User) do
      @user = Services::PartialRegistration::UserBuilder.call(request: @request)
    end

    default_params = user_params
    assert_equal default_params[:name], @user.name
    assert_equal User.hash_email(TEST_USER_EMAIL), @user.hashed_email
    assert_equal default_params[:age], @user.age.to_s
    assert_equal default_params[:us_state], @user.us_state
    assert_equal default_params[:terms_of_service_version], @user.terms_of_service_version
  end

  test 'builds student user with parent opted out of marketing emails' do
    parent_email = 'fake_parent@email.com'
    setup_partial_user({parent_email_preference_email: parent_email})

    assert_creates(User) do
      @user = Services::PartialRegistration::UserBuilder.call(request: @request)
    end

    assert_equal parent_email, @user.parent_email
    assert_equal TEST_IP, @user.parent_email_preference_request_ip
    assert_equal ::User::ACCOUNT_SIGN_UP, @user.parent_email_preference_source
    assert_equal 'no', @user.parent_email_preference_opt_in
    refute EmailPreference.where(email: @user.parent_email).last.opt_in
  end

  test 'builds student user with parent opted in to marketing emails' do
    parent_email = 'fake_parent@email.com'
    setup_partial_user({parent_email_preference_email: parent_email, parent_email_preference_opt_in: true})

    assert_creates(User) do
      @user = Services::PartialRegistration::UserBuilder.call(request: @request)
    end

    assert_equal parent_email, @user.parent_email
    assert_equal TEST_IP, @user.parent_email_preference_request_ip
    assert_equal ::User::ACCOUNT_SIGN_UP, @user.parent_email_preference_source
    assert_equal 'yes', @user.parent_email_preference_opt_in
    assert EmailPreference.where(email: @user.parent_email).last.opt_in
  end

  # Teacher tests
  test 'builds teacher user with default values' do
    setup_partial_user({user_type: 'teacher'})

    assert_creates(User) do
      @user = Services::PartialRegistration::UserBuilder.call(request: @request)
    end

    default_params = user_params
    assert_equal default_params[:name], @user.name
    assert_equal TEST_USER_EMAIL, @user.email
    assert_equal '21+', @user.age.to_s
    assert_equal default_params[:terms_of_service_version], @user.terms_of_service_version

    assert_equal 'no', @user.email_preference_opt_in
    refute EmailPreference.where(email: @user.email).last.opt_in
  end

  test 'builds teacher user opted into marketing emails' do
    setup_partial_user({user_type: 'teacher', email_preference_opt_in: true})

    assert_creates(User) do
      @user = Services::PartialRegistration::UserBuilder.call(request: @request)
    end

    assert_equal 'yes', @user.email_preference_opt_in
    assert EmailPreference.where(email: @user.email).last.opt_in
  end

  # CHECK THAT ALL OTHER FIELDS ARE SET FOR PARENT (like source, ip, etc) IF POSSIBLE (SAME FOR OTHER EMAIL TESTS AND OTHER
  # FIELDS THAT ARE SET IN USER_BUILDER BUT NOT PASSED IN AHEAD OF TIME)
  # school combos
  # GDPR combos
  # Examples where a user should NOT be created? maybe like broken or missing params or something
end
