# Authenticate and redirect a Code Studio user to Mimeo using their single-sign-on (SSO) API
class Pd::MimeoSsoController < ApplicationController
  load_resource :enrollment, class: 'Pd::Enrollment', find_by: :code, id_param: :enrollment_code

  ENDPOINT = 'https://my.mimeo.com/sso/authenticate.ashx'.freeze
  AUTHORIZED_MARKETPLACE_URL = 'unpluggedlessonmaterials'.freeze
  SSO_VERSION = '2.0'.freeze

  ALLOWED_COURSES = [Pd::Workshop::COURSE_CSF].freeze

  def authenticate_and_redirect
    # Make sure the enrollment is for an allowed course and has a completed survey
    unless ALLOWED_COURSES.include?(@enrollment.workshop.course) && @enrollment.completed_survey?
      render_404
      return
    end

    # First name is always present, but some older enrollments don't have last names.
    # The API requires both so substitute a placeholder for blank last names:
    first_name = @enrollment.first_name
    last_name = @enrollment.last_name.present? ? @enrollment.last_name : '-'

    # Set up fields for the Mimeo SSO API. Each of these will be rendered as a hidden field on a form which will be
    # automatically posted to the @endpoint on page load.
    # Mimeo's API will then authenticate and either redirect the user's browser to the redirectUrl on success,
    # or to our errorUrl if it fails (see #error below).
    @endpoint = ENDPOINT
    @fields = {
      firstName: encrypt_token(first_name),
      lastName: encrypt_token(last_name),
      email: encrypt_token(@enrollment.email),
      companyId: secret(:company_id),
      organizationId: secret(:organization_id, encrypt: true),
      companyName: secret(:company_name, encrypt: true),
      ssoVersion: SSO_VERSION,
      redirectUrl: secret(:redirect_url),
      errorUrl: url_for(action: 'error', enrollment_code: @enrollment.code),
      authorizedMarketPlaceUrl: AUTHORIZED_MARKETPLACE_URL,

      # These 2 intentionally left blank
      customId: encrypt_token(''),
      initialCredit: encrypt_token('')
    }.stringify_keys
  end

  # When there is an authentication error, Mimeo's API will redirect the user's browser
  # to this error page, specified as errorUrl above, and supply params for the error code and message.
  def error
    @code = params[:code]
    @message = params[:message]
  end

  private

  # Lookup a secret by key in the CDO.mimeo_sso hash (supplied by chef or one of the config.yml files)
  # @param key [String] hash key for the secret to read
  # @param :encrypt [Boolean] (false) whether or not to RSA-encrypt the secret
  # @raise [KeyError] if the key not found, including if the entire CDO.mimeo_sso hash is missing.
  # @return [String] retrieved and optionally encrypted secret
  def secret(key, encrypt: false)
    @secrets ||= CDO.mimeo_sso

    key = key.to_s
    raise KeyError, "Unable to find mimeo sso secret: #{key}" unless @secrets && @secrets.key?(key)
    secret = @secrets[key]
    encrypt ? encrypt_token(secret) : secret
  end

  # Encrypt a string token with the RSA public key.
  # The key is obtained as a Base64-encoded string from secret(:rsa_public_key)
  # @param token [String] string to be encrypted
  # @return [String] encrypted and Base64 encoded token
  def encrypt_token(token)
    return nil if token.nil?

    @rsa ||= OpenSSL::PKey::RSA.new Base64.decode64(secret(:rsa_public_key))
    Base64.encode64(@rsa.public_encrypt(token))
  end
end
