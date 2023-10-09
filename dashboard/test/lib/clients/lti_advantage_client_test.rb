require 'test_helper'
require_relative '../../../lib/clients/lti_advantage_client'

class LtiAdvantageClientTest < ActiveSupport::TestCase
  setup do
    @lti_client = LtiAdvantageClient.new('client_id', 'issuer')
    @lti_client.stubs(:get_access_token).returns('fake_access_token')
  end

  test 'throws an error if the API returns a non-200 response' do
    HTTParty.stubs(:get).returns(OpenStruct.new({code: 400}))
    @lti_client.expects(:sign_jwt).never # should not be called since the get_access_token method is stubbed
    assert_raises RuntimeError do
      @lti_client.get_context_membership('https://foolms.com/api/sections/1')
    end
  end

  test 'throws an error if no client_id or issuer is provided' do
    assert_raises ArgumentError do
      LtiAdvantageClient.new(nil, nil)
    end
  end
end
