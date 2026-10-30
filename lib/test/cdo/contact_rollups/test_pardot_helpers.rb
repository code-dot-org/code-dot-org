require_relative '../../test_helper'
require 'cdo/contact_rollups/v2/pardot_helpers'

class PardotHelpersTest < Minitest::Test
  extend PardotHelpers

  def test_raise_if_response_error
    # List of Pardot error codes: http://developer.pardot.com/kb/error-codes-messages/
    error_code = 51
    error_text = 'Invalid parameter'
    pardot_error = Nokogiri::XML <<-XML
      <rsp stat="fail" version="1.0">
        <err code="#{error_code}">#{error_text}</err>
      </rsp>
    XML

    exception = assert_raises do
      # Since the method we want to test is a private method, we have to invoke it using `send`
      PardotHelpersTest.send(:raise_if_response_error, pardot_error)
    end

    assert_match /#{error_code}.*#{error_text}/, exception.message
  end

  def test_raise_if_response_error_no_error
    pardot_ok = Nokogiri::XML <<-XML
      <rsp stat="ok" version="1.0">
        <result>
          <total_results>0</total_results>
        </result>
      </rsp>
    XML

    assert_nil PardotHelpersTest.send(:raise_if_response_error, pardot_ok)
  end

  def test_try_with_exponential_backoff_one_retry
    try_counter = 0
    max_tries = 2
    assert_raises RuntimeError do
      PardotHelpersTest.try_with_exponential_backoff(max_tries, [RuntimeError]) do
        try_counter += 1
        raise RuntimeError
      end
    end
    assert try_counter == max_tries
  end

  def test_try_with_exponential_backoff_no_retry
    try_counter = 0
    PardotHelpersTest.try_with_exponential_backoff(3, [RuntimeError]) {try_counter += 1}
    assert try_counter == 1
  end

  def reset_access_token_cache
    PardotHelpers.class_variable_set(:@@access_token, nil)
  end

  def test_post_request_with_auth_requests_token_when_cache_empty
    reset_access_token_cache

    PardotHelpersTest.expects(:request_api_access_token).once
    PardotHelpersTest.expects(:post_request).with('https://example.com').once

    PardotHelpersTest.send(:post_request_with_auth, 'https://example.com')
  ensure
    reset_access_token_cache
  end

  def test_post_request_with_auth_reuses_cached_token
    PardotHelpers.class_variable_set(:@@access_token, 'fresh-token')

    PardotHelpersTest.expects(:request_api_access_token).never
    PardotHelpersTest.expects(:post_request).with('https://example.com').once

    PardotHelpersTest.send(:post_request_with_auth, 'https://example.com')
  ensure
    reset_access_token_cache
  end
end
