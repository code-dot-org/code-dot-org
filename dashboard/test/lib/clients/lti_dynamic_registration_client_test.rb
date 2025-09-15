require 'test_helper'
require 'securerandom'
require_relative '../../../lib/clients/lti_dynamic_registration_client'
require 'webmock/minitest'
WebMock.disable_net_connect!(allow_localhost: true)

module Lti
  class DynamicRegistrationClientTest < ActiveSupport::TestCase
    setup do
      registration_token = SecureRandom.uuid
      @registration_endpoint = 'https://example.com'
      @client_id = SecureRandom.alphanumeric(10)
      @registration_client = LtiDynamicRegistrationClient.new(registration_token, @registration_endpoint)
    end

    test 'Returns response body with client_id when successful response from the registration_endpoint' do
      stub_request(:post, @registration_endpoint).to_return(
        body: {
          client_id: @client_id,
        }.to_json,
        status: 200,
        headers: {'Content-Type' => 'application/json'},
      )

      res = @registration_client.make_registration_request
      assert_equal res[:client_id], @client_id
    end

    test 'Raises error when it does not recieve a succesful repsonse from the registration_endpoint' do
      status_code = 500
      body = {}
      stub_request(:post, @registration_endpoint).to_return({body: body.to_json, status: status_code})
      actual_error = assert_raises(RuntimeError) {@registration_client.make_registration_request}
      assert_equal "Error making registration request: #{status_code} #{body}", actual_error.message
    end

    test 'throws an error if no registration_token or registration_endpoint is provided' do
      assert_raises ArgumentError do
        LtiDynamicRegistrationClient.new(nil, nil)
      end
    end
  end
end
