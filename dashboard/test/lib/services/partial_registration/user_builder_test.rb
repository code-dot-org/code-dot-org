require 'test_helper'

class Services::PartialRegistration::UserBuilderTest < ActiveSupport::TestCase
  TEST_USER_NAME = 'Fake User'
  TEST_USER_EMAIL = 'fake_user@email.org'
  TEST_IP = '1.2.3.4'
  TEST_AGE = '10'
  TEST_STATE = 'WA'

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
      name: TEST_USER_NAME
    }

    if default_params[:user_type] == 'student'
      default_params[:age] = TEST_AGE
      default_params[:us_state] = TEST_STATE
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

  # Requires base params
  test 'does not build user with no user_type' do
    setup_partial_user({user_type: nil})

    refute_creates(User) do
      exception = assert_raises(Exception) {Services::PartialRegistration::UserBuilder.call(request: @request)}
      assert_equal "Validation failed: Account Type is required", exception.message
    end
  end

  test 'does not build user with no email' do
    setup_partial_user({email: nil, hashed_email: nil})

    refute_creates(User) do
      exception = assert_raises(Exception) {Services::PartialRegistration::UserBuilder.call(request: @request)}
      assert_equal "Validation failed: Email is required", exception.message
    end
  end

  test 'does not build user with no name' do
    setup_partial_user({name: nil})

    refute_creates(User) do
      exception = assert_raises(Exception) {Services::PartialRegistration::UserBuilder.call(request: @request)}
      assert_equal "Validation failed: Display Name is required", exception.message
    end
  end

  test 'does not build user with no age' do
    setup_partial_user({age: nil})

    refute_creates(User) do
      exception = assert_raises(Exception) {Services::PartialRegistration::UserBuilder.call(request: @request)}
      assert_equal "Validation failed: Age is required", exception.message
    end
  end

  # Student tests
  test 'does not build US student user with no state' do
    setup_partial_user({country_code: 'US', us_state: nil})

    refute_creates(User) do
      exception = assert_raises(Exception) {Services::PartialRegistration::UserBuilder.call(request: @request)}
      assert_equal "Validation failed: State is required", exception.message
    end
  end

  test 'builds student user with default values' do
    setup_partial_user

    assert_creates(User) do
      @user = Services::PartialRegistration::UserBuilder.call(request: @request)
    end

    assert_equal TEST_USER_NAME, @user.name
    assert_equal User.hash_email(TEST_USER_EMAIL), @user.hashed_email
    assert_equal TEST_AGE, @user.age.to_s
    assert_equal TEST_STATE, @user.us_state
    assert @user.terms_of_service_version
  end

  test 'builds student user with parent opted out of marketing emails' do
    parent_email = 'fake_parent@email.com'
    setup_partial_user({parent_email_preference_email: parent_email})

    assert_creates(User) do
      @user = Services::PartialRegistration::UserBuilder.call(request: @request)
    end

    assert_equal parent_email, @user.parent_email
    assert_equal TEST_IP, @user.parent_email_preference_request_ip
    assert_equal EmailPreference::ACCOUNT_SIGN_UP, @user.parent_email_preference_source
    assert_equal '0', @user.parent_email_update_only
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
    assert_equal EmailPreference::ACCOUNT_SIGN_UP, @user.parent_email_preference_source
    assert_equal '0', @user.parent_email_update_only
    assert_equal 'yes', @user.parent_email_preference_opt_in
    assert EmailPreference.where(email: @user.parent_email).last.opt_in
  end

  # Teacher tests
  test 'builds teacher user with default values' do
    setup_partial_user({user_type: 'teacher'})

    assert_creates(User) do
      @user = Services::PartialRegistration::UserBuilder.call(request: @request)
    end

    assert_equal TEST_USER_NAME, @user.name
    assert_equal TEST_USER_EMAIL, @user.email
    assert_equal '21+', @user.age.to_s
    assert @user.terms_of_service_version

    assert_equal TEST_IP, @user.email_preference_request_ip
    assert_equal EmailPreference::ACCOUNT_SIGN_UP, @user.email_preference_source
    assert_equal '0', @user.email_preference_form_kind
    assert_equal 'no', @user.email_preference_opt_in
    refute EmailPreference.where(email: @user.email).last.opt_in
  end

  test 'builds teacher user opted into marketing emails' do
    setup_partial_user({user_type: 'teacher', email_preference_opt_in: true})

    assert_creates(User) do
      @user = Services::PartialRegistration::UserBuilder.call(request: @request)
    end

    assert_equal TEST_IP, @user.email_preference_request_ip
    assert_equal EmailPreference::ACCOUNT_SIGN_UP, @user.email_preference_source
    assert_equal '0', @user.email_preference_form_kind
    assert_equal 'yes', @user.email_preference_opt_in
    assert EmailPreference.where(email: @user.email).last.opt_in
  end

  test 'builds teacher with nces school in our database' do
    fake_school = create :school
    fake_school_info = create :school_info, school_id: fake_school.id
    setup_partial_user({user_type: 'teacher', school_info_attributes:
      {
        school_id: fake_school.id,
      }}
    )

    assert_creates(User) do
      @user = Services::PartialRegistration::UserBuilder.call(request: @request)
    end

    assert_equal fake_school_info.id, @user.school_info_id
    assert UserSchoolInfo.where(school_info_id: fake_school_info.id, user_id: @user.id)
  end

  test 'builds teacher that adds their own US school' do
    school_name = 'Fake US School Name'
    school_zip = '11111'
    school_country = 'US'
    setup_partial_user({user_type: 'teacher', school_info_attributes:
      {
        school_name: school_name,
        zip: school_zip,
        country: school_country,
      }}
    )

    assert_creates(User) do
      @user = Services::PartialRegistration::UserBuilder.call(request: @request)
    end

    school_info = SchoolInfo.last
    assert_nil school_info.school_id
    assert_equal school_name, school_info.school_name
    assert_equal school_zip, school_info.zip.to_s
    assert_equal school_country, school_info.country
    assert UserSchoolInfo.where(school_info_id: school_info.id, user_id: @user.id)
  end

  test 'builds teacher that adds their own non-US school' do
    school_name = 'Fake Mexico School Name'
    school_country = 'MX'
    setup_partial_user({user_type: 'teacher', school_info_attributes:
      {
        school_name: school_name,
        country: school_country,
      }}
    )

    assert_creates(User) do
      @user = Services::PartialRegistration::UserBuilder.call(request: @request)
    end

    school_info = SchoolInfo.last
    assert_nil school_info.school_id
    assert_equal school_name, school_info.school_name
    assert_equal school_country, school_info.country
    assert UserSchoolInfo.where(school_info_id: school_info.id, user_id: @user.id)
  end

  test 'builds teacher that does not teach in a school setting' do
    school_country = 'US'
    school_zip = '11111'
    setup_partial_user({user_type: 'teacher', school_info_attributes:
      {
        school_type: SharedConstants::NON_SCHOOL_OPTIONS.NO_SCHOOL_SETTING,
        country: school_country,
        zip: school_zip
      }}
    )

    assert_creates(User) do
      @user = Services::PartialRegistration::UserBuilder.call(request: @request)
    end

    school_info = SchoolInfo.last
    assert_nil school_info.school_id
    assert_equal school_country, school_info.country
    assert UserSchoolInfo.where(school_info_id: school_info.id, user_id: @user.id)
  end

  test 'does not build teacher in EU that does not accept GDPR agreement' do
    setup_partial_user({user_type: 'teacher', data_transfer_agreement_required: true})

    refute_creates(User) do
      exception = assert_raises(Exception) {Services::PartialRegistration::UserBuilder.call(request: @request)}
      assert_equal "Validation failed: Data transfer agreement accepted must be accepted", exception.message
    end
  end

  test 'builds teacher in EU that accepts GDPR agreement' do
    setup_partial_user({user_type: 'teacher', data_transfer_agreement_required: true, data_transfer_agreement_accepted: '1'})

    assert_creates(User) do
      @user = Services::PartialRegistration::UserBuilder.call(request: @request)
    end

    assert @user.data_transfer_agreement_accepted
    assert_equal TEST_IP, @user.data_transfer_agreement_request_ip
    assert_equal ::User::ACCOUNT_SIGN_UP, @user.data_transfer_agreement_source
    assert_equal '0', @user.data_transfer_agreement_kind
    refute_nil @user.data_transfer_agreement_at
  end
end
