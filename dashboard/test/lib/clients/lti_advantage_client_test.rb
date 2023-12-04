require 'test_helper'
require_relative '../../../lib/clients/lti_advantage_client'

class LtiAdvantageClientTest < ActiveSupport::TestCase
  setup do
    @client_id = 'expected_client_id'
    @issuer = 'expected_issuer'

    @lti_client = LtiAdvantageClient.new(@client_id, @issuer)
    @lti_client.stubs(:get_access_token).returns('fake_access_token')
  end

  test 'throws an error if the API returns a non-200 response' do
    response_code = 'non-200_response_code'
    response_body = 'expected_response_body'

    access_token = 'expected_access_token'
    url = 'expected_url'
    expected_headers = {
      'Accept' => 'application/vnd.ims.lti-nrps.v2.membershipcontainer+json',
      'Authorization' => "Bearer #{access_token}"
    }

    @lti_client.expects(:sign_jwt).never # should not be called since the get_access_token method is stubbed
    @lti_client.expects(:get_access_token).with(@client_id, @issuer).once.returns(access_token)
    HTTParty.expects(:get).with(url, headers: expected_headers).once.returns(stub(code: response_code, body: response_body))

    actual_error = assert_raises(RuntimeError) {@lti_client.get_context_membership(url)}
    assert_equal "Error getting context membership: #{response_code} #{response_body}", actual_error.message
  end

  test 'throws an error if no client_id or issuer is provided' do
    assert_raises ArgumentError do
      LtiAdvantageClient.new(nil, nil)
    end
  end
end
