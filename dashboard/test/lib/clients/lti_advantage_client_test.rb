require 'test_helper'
require_relative '../../../lib/clients/lti_advantage_client'

class LtiAdvantageClientTest < ActiveSupport::TestCase
  include LtiAccessToken

  test 'throws an error if the API returns a non-200 response' do
    HTTParty.stubs(:get).returns(OpenStruct.new({code: 400}))
    LtiAccessToken.stubs(:get_access_token).returns('fake_access_token')
    assert_raises RuntimeError do
      LtiAdvantageClient.new('client_id', 'issuer').get_context_membership('https://foolms.com/api/sections/1')
    end
  end

  test 'throws an error if no client_id or issuer is provided' do
    assert_raises ArgumentError do
      LtiAdvantageClient.new(nil, nil)
    end
  end
end
