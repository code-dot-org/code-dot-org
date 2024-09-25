require 'test_helper'
#require_relative '../../../app/lib/clients/lti_advantage_client'

class LtiAdvantageClientTest < ActiveSupport::TestCase
  setup do
    @client_id = 'expected_client_id'
    @issuer = 'expected_issuer'
    @rlid = 'expected_rlid'

    @lti_client = LtiAdvantageClient.new(@client_id, @issuer)
    @lti_client.stubs(:get_access_token).returns('fake_access_token')
    @page_2_url = 'https://example.com/api/lti/courses/1234/memberships?rlid=1234&page=2'
    @page_3_url = 'https://example.com/api/lti/courses/1234/memberships?rlid=1234&page=3'
    @response_page_1 = {
      headers: {
        link: "<#{@page_2_url}>; rel=\"next\""
      },
      body: {
        members: (1..50).to_a
      }
    }
    @response_page_2 = {
      headers: {
        link: "<#{@page_3_url}>; rel=\"next\""
      },
      body: {
        members: (1..50).to_a
      }
    }
    @response_page_3 = {
      body: {
        members: (1..50).to_a
      }
    }
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
    expected_query = {
      rlid: @rlid,
      limit: 100
    }

    @lti_client.expects(:sign_jwt).never # should not be called since the get_access_token method is stubbed
    @lti_client.expects(:get_access_token).with(@client_id, @issuer).once.returns(access_token)
    HTTParty.expects(:get).with(url, headers: expected_headers, query: expected_query).once.returns(stub(code: response_code, body: response_body))
    Policies::Lti.stubs(:issuer_accepts_resource_link?).returns(true)
    actual_error = assert_raises(RuntimeError) {@lti_client.get_context_membership(url, @rlid)}
    assert_equal "Error getting context membership: #{response_code} #{response_body}", actual_error.message
  end

  test 'throws an error if no client_id or issuer is provided' do
    assert_raises ArgumentError do
      LtiAdvantageClient.new(nil, nil)
    end
  end

  test 'fetches the next page if present' do
    original_url = "https://example.com/api/lti/courses/1234/memberships?rlid=1234"
    @lti_client.expects(:make_request).with(original_url, anything).once.returns(@response_page_1)
    @lti_client.expects(:make_request).with(@page_2_url, anything).once.returns(@response_page_2)
    @lti_client.expects(:make_request).with(@page_3_url, anything).once.returns(@response_page_3)
    res = @lti_client.get_context_membership(original_url, @rlid)
    assert_equal 150, res[:members].length
  end
end
