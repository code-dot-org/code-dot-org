require 'test_helper'

class Pd::MimeoSsoControllerTest < ::ActionController::TestCase
  setup do
    @workshop = create :pd_ended_workshop, course: Pd::Workshop::COURSE_CSF
    @teacher = create :teacher
    @enrollment = create :pd_enrollment, workshop: @workshop, user: @teacher,
      full_name: @teacher.name, email: @teacher.email, completed_survey_id: 1234

    @fake_rsa_key = 'fake rsa key'

    @secrets = {
      rsa_public_key: Base64.encode64(@fake_rsa_key),
      organization_id: 'fake organization id',
      company_id: 'fake company id',
      company_name: 'fake company name',
      redirect_url: 'fake redirect url'
    }.stringify_keys
    @mock_rsa = mock
    OpenSSL::PKey::RSA.stubs(:new).with(@fake_rsa_key).returns(@mock_rsa)
    @mock_rsa.stubs(:public_encrypt).returns('fake encrypted token')
    CDO.stubs(:mimeo_sso).returns @secrets
  end

  test 'valid enrollment codes succeed' do
    get :authenticate_and_redirect, params: {enrollment_code: @enrollment.code}
    assert_response :success
  end

  test 'disallowed courses return not found' do
    @workshop.update!(course: Pd::Workshop::COURSE_CSD)

    get :authenticate_and_redirect, params: {enrollment_code: @enrollment.code}
    assert_response :not_found
  end

  test 'incomplete surveys return not found' do
    Pd::Enrollment.any_instance.expects(:completed_survey?).returns(false)

    get :authenticate_and_redirect, params: {enrollment_code: @enrollment.code}
    assert_response :not_found
  end

  test 'blank last name is replaced with a placeholder' do
    @enrollment.last_name = nil
    @enrollment.save!(validate: false)

    # Expect '-' placeholder last name
    @mock_rsa.expects(:public_encrypt).with(@enrollment.first_name).returns('encrypted first name').then.
      with('-').returns('encrypted last name')

    get :authenticate_and_redirect, params: {enrollment_code: @enrollment.code}
    assert_response :success
  end

  test 'public key format' do
    OpenSSL::PKey::RSA.unstub(:new)

    # This is to test the key format (base64-encoded raw public key with no extra markup)
    # This test key was generated via: Base64.encode64(OpenSSL::PKey::RSA.new(128).public_key.to_der).strip
    # Obviously this key is insecure and should not be used in production.
    @secrets['rsa_public_key'] = "MCwwDQYJKoZIhvcNAQEBBQADGwAwGAIRANejYVd2T5zbWOZbAuTquCECAwEA\nAQ=="
    assert_not_empty Pd::MimeoSsoController.new.send(:encrypt_token, 'token')

    @secrets['rsa_public_key'] = 'invalid key'
    e = assert_raises OpenSSL::PKey::RSAError do
      Pd::MimeoSsoController.new.send(:encrypt_token, 'token')
    end
    assert e.message.start_with? 'Neither PUB key nor PRIV key'
  end

  test 'rendered form' do
    expect_rsa_encrypt with: @enrollment.first_name, returns: 'encrypted first name'
    expect_rsa_encrypt with: @enrollment.last_name, returns: 'encrypted last name'
    expect_rsa_encrypt with: @enrollment.email, returns: 'encrypted email'
    expect_rsa_encrypt with: 'fake organization id', returns: 'encrypted organization id'
    expect_rsa_encrypt with: 'fake company name', returns: 'encrypted company name'

    # These 2 are in reverse order since Mocha matches expectations from newest to oldest
    # See http://gofreerange.com/mocha/docs/#Expectation_matching___invocation_order
    expect_rsa_encrypt with: '', returns: 'encrypted empty initial credit'
    expect_rsa_encrypt with: '', returns: 'encrypted empty custom id'

    get :authenticate_and_redirect, params: {enrollment_code: @enrollment.code}
    assert_response :success

    expected_fields = {
      firstName: 'encrypted first name',
      lastName: 'encrypted last name',
      email: 'encrypted email',
      companyId: 'fake company id', # company Id is not encrypted
      organizationId: 'encrypted organization id',
      companyName: 'encrypted company name',
      ssoVersion: '2.0',
      redirectUrl: 'fake redirect url',
      customId: 'encrypted empty custom id',
      initialCredit: 'encrypted empty initial credit',
      authorizedMarketPlaceUrl: 'unpluggedlessonmaterials'
    }

    assert_select 'div#mimeo_redirect' do
      # Assert form fields
      assert_select 'form' do
        assert_select '[action="https://my.mimeo.com/sso/authenticate.ashx"]'

        expected_fields.each do |name, value|
          assert_select "input[name='#{name}'][type='hidden'][value=?]", value
        end

        selected_error_url = assert_select "input[name='errorUrl'][type='hidden']"
        assert selected_error_url.first['value'].end_with?("/pd/mimeo/#{@enrollment.code}/error")
      end
    end

    # Make sure the auto-submit javascript is present
    script = assert_select 'script'
    assert script.first.to_s.scan /window\.onload =.+document\.forms\[0\]\.submit\(\);/
  end

  private

  def expect_rsa_encrypt(with:, returns:)
    @mock_rsa.expects(:public_encrypt).with(with).returns(returns)

    # stub out the base 64 encoding as a no-op for easier assertions
    Base64.expects(:encode64).with(returns).returns(returns)
  end
end
