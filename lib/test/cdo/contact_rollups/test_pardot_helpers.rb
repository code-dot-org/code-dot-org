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
end
