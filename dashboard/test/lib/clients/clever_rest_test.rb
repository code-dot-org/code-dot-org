require 'test_helper'

class Clients::CleverRestTest < ActiveSupport::TestCase
  subject(:described_class) {Clients::CleverRest}
  subject(:described_instance) {described_class.new(oauth_token:)}

  let(:oauth_token) {Faker::Internet.device_token}

  describe '#get' do
    subject(:get_request) {described_instance.get(endpoint)}

    let(:endpoint) {'expected/endpoint'}

    it 'returns parsed JSON response from Clever v2.1 API endpoint' do
      expected_response = 'expected_response'

      RestClient.
        expects(:get).
        with("https://api.clever.com/v2.1/#{endpoint}", {authorization: "Bearer #{oauth_token}"}).
        returns(expected_response.to_json)

      _get_request.must_equal expected_response
    end
  end
end
