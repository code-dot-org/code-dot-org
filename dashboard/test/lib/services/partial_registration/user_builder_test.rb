require 'test_helper'

class Services::PartialRegistration::UserBuilderTest < ActiveSupport::TestCase
  TEST_USER_EMAIL = 'fake_user@email.org'

  after do
    PartialRegistration.delete @request.session

    test_user_to_delete = User.find_by_email_or_hashed_email(TEST_USER_EMAIL)
    test_user_to_delete&.destroy
  end

  def user_params(override_params = {})
    default_params = {
      user_type: override_params[:user_type] || 'student',
      email: TEST_USER_EMAIL,
      hashed_email: 'fake_user@email.org',
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
    env = Rack::MockRequest.env_for("test-env", 'HTTP_X_FORWARDED_FOR' => '1.2.3.4', :params => {user: user_params(override_params)})
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

    # Not opting into marketing emails saves EmailPreference as false
    assert_equal 'no', @user.email_preference_opt_in
    refute EmailPreference.where(email: @user.email).last.opt_in
  end

  test 'builds teacher user opted into marketing emails' do
    setup_partial_user({user_type: 'teacher', email_preference_opt_in: true})

    assert_creates(User) do
      @user = Services::PartialRegistration::UserBuilder.call(request: @request)
    end

    # Opting into marketing emails saves EmailPreference as true
    assert_equal 'yes', @user.email_preference_opt_in
    assert EmailPreference.where(email: @user.email).last.opt_in
  end

  # parent combos
  # parent email pref combos
  # school combos
  # GDPR combos
end
