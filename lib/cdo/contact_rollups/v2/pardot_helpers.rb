module PardotHelpers
  AUTHENTICATION_URL = "https://pi.pardot.com/api/login/version/4".freeze
  SUCCESS_HTTP_CODES = %w(200 201 204).freeze
  STATUS_OK = 'ok'.freeze
  ERROR_INVALID_EMAIL = 'Invalid prospect email address'
  ERROR_INVALID_API_KEY = 'Invalid API key or user key'
  ERROR_PROSPECT_DELETED_FROM_PARDOT = 'Prospect deleted from Pardot'

  class InvalidApiKeyException < RuntimeError; end

  # Tries a given block a certain number of times.
  # Retries if the block fails because of one of the retriable errors/exceptions.
  #
  # @param max_tries [Integer]
  # @param retriable_errors [Array<Exception>]
  # @raise [ArgumentError] if no block given
  # @raise One of the retriable errors if they occurs more than max_tries times
  def try_with_exponential_backoff(max_tries, retriable_errors = [Net::ReadTimeout])
    raise ArgumentError.new('No block given') unless block_given?

    max_sleep_seconds = 10
    tries = 0
    begin
      tries += 1
      yield
    rescue *retriable_errors => e
      if tries < max_tries
        sleep([2**tries, max_sleep_seconds].min)
        retry
      end
      raise e
    end
  end

  def log(s)
    CDO.log.info s
  end

  private

  # Note: Pardot API key can become invalid and need to be refreshed midstream.
  @@api_key = nil

  # Authenticates and requests a new API key.
  # API keys are valid for one hour while user keys are valid indefinitely.
  # http://developer.pardot.com/#authentication
  #
  # @return [String] API key to use for subsequent requests
  # @note This method has a side effect (it modifies a class variable) and may raise exception.
  def request_api_key
    doc = post_request(
      AUTHENTICATION_URL,
      {
        email: CDO.pardot_username,
        password: CDO.pardot_password,
        user_key: CDO.pardot_user_key
      }
    )

    status = get_response_status doc
    raise "Pardot authentication response failed with status #{status}  #{doc}" unless
      status == STATUS_OK

    api_key = doc.xpath('/rsp/api_key').text
    raise 'Pardot authentication response did not include api_key' if api_key.nil?

    @@api_key = api_key
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
    request_api_key
    post_request_with_auth(url)
  end

  # Make an API request with Pardot authentication
  #
  # @param url [String] URL to post to. The URL should not contain auth params.
  # @return [Nokogiri::XML] XML response from Pardot
  def post_request_with_auth(url)
    request_api_key if @@api_key.nil?
    post_request(
      url,
      {api_key: @@api_key, user_key: CDO.pardot_user_key}
    )
  end

  # Make an API request. This method may raise exceptions.
  #
  # @param url [String] URL to post to
  # @param params [Hash] hash of POST params (may be empty hash or contain API and user keys)
  # @return [Nokogiri::XML, nil] XML response from Pardot
  def post_request(url, params)
    uri = URI(url)
    response = Net::HTTP.post_form(uri, params)

    # TODO: Return a custom exception containing both the HTTP response code and
    #   the (parsed) response body. The detailed error is in the response body.
    raise "Pardot request failed with HTTP #{response.code}" unless
      SUCCESS_HTTP_CODES.include?(response.code)

    return nil if response.code == '204'  # No content

    doc = Nokogiri::XML(response.body, &:noblanks)
    raise 'Pardot response did not return parsable XML' if doc.nil?

    error_details = doc.xpath('/rsp/err').text
    raise InvalidApiKeyException if error_details.include? ERROR_INVALID_API_KEY

    status = get_response_status doc
    raise 'Pardot response did not include status' if status.nil?

    doc
  end

  # Parse a Pardot XML response and raise an exception on the first error if there is one.
  # http://developer.pardot.com/kb/error-codes-messages/
  #
  # @param doc [Nokogiri::XML] XML response from Pardot
  def raise_if_response_error(doc)
    status = get_response_status doc
    return if status == STATUS_OK

    error_code = doc.xpath('//err/@code').first&.value || 'unknown'
    error_text = doc.xpath('//err').first&.children&.text || 'unknown error message'
    raise "Error in Pardot response: code #{error_code}, #{error_text}"
  end

  def get_response_status(doc)
    doc.xpath('/rsp/@stat').text
  end
end
