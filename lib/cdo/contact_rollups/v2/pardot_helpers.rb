module PardotHelpers
  PARDOT_AUTHENTICATION_URL = "https://pi.pardot.com/api/login/version/4".freeze
  PARDOT_SUCCESS_HTTP_CODES = %w(200 201 204).freeze

  class InvalidApiKeyException < RuntimeError
  end

  private

  # Note: Pardot API key can become invalid and need to be refreshed midstream.
  @@pardot_api_key = nil

  # Authenticates and requests a new API key.
  # API keys are valid for one hour while user keys are valid indefinitely.
  # http://developer.pardot.com/#authentication
  #
  # @return [String] API key to use for subsequent requests
  # @note This method has a side effect (it modifies a class variable) and may raise exception.
  def request_pardot_api_key
    doc = post_request(
      PARDOT_AUTHENTICATION_URL,
      {
        email: CDO.pardot_username,
        password: CDO.pardot_password,
        user_key: CDO.pardot_user_key
      }
    )

    status = doc.xpath('/rsp/@stat').text
    raise "Pardot authentication response failed with status #{status}  #{doc}" unless status == 'ok'

    api_key = doc.xpath('/rsp/api_key').text
    raise 'Pardot authentication response did not include api_key' if api_key.nil?

    @@pardot_api_key = api_key
  end

  # Makes an API request with Pardot authentication.
  # Retries with new Pardot API key if necessary.
  #
  # @param url [String] URL to post to
  # @return [Nokogiri::XML, nil] XML response from Pardot
  def post_with_auth_retry(url)
    post_request_with_auth(url)
  rescue InvalidApiKeyException
    # The API key might have been expired, try again with a new API key
    request_pardot_api_key
    post_request_with_auth(url)
  end

  # Make an API request with Pardot authentication
  #
  # @param url [String] URL to post to. The URL should not contain auth params.
  # @return [Nokogiri::XML] XML response from Pardot
  def post_request_with_auth(url)
    request_pardot_api_key if @@pardot_api_key.nil?
    post_request(
      url,
      {api_key: @@pardot_api_key, user_key: CDO.pardot_user_key}
    )
  end

  # Make an API request. This method may raise exceptions.
  #
  # @param url [String] URL to post to - must already include Pardot auth params
  # @param params [Hash] hash of POST params (may be empty hash)
  # @return [Nokogiri::XML, nil] XML response from Pardot
  def post_request(url, params)
    uri = URI(url)
    response = Net::HTTP.post_form(uri, params)

    raise "Pardot request failed with HTTP #{response.code}" unless
      PARDOT_SUCCESS_HTTP_CODES.include?(response.code)

    return nil if response.code == '204'  # No content

    doc = Nokogiri::XML(response.body, &:noblanks)
    raise 'Pardot response did not return parsable XML' if doc.nil?

    error_details = doc.xpath('/rsp/err').text
    raise InvalidApiKeyException if error_details.include? 'Invalid API key or user key'

    status = doc.xpath('/rsp/@stat').text
    raise 'Pardot response did not include status' if status.nil?

    doc
  end

  # Parse a Pardot XML response and raise an exception on the first error if there is one.
  # http://developer.pardot.com/kb/error-codes-messages/
  #
  # @param doc [Nokogiri::XML] XML response from Pardot
  def raise_if_response_error(doc)
    status = doc.xpath('/rsp/@stat').text
    return if status == 'ok'

    error_code = doc.xpath('//err/@code').first&.value || 'unknown'
    error_text = doc.xpath('//err').first&.children&.text || 'unknown error message'
    raise "Error in Pardot response: code #{error_code}, #{error_text}"
  end
end
