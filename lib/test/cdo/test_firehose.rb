require_relative '../test_helper'
require 'cdo/firehose'

class FirehoseTest < Minitest::Test
  def setup
    @client = FirehoseClient.client = Aws::Firehose::Client.new(stub_responses: true)
  end

  def teardown
    FirehoseClient.client = nil
  end

  def test_firehose
    FirehoseClient.instance.put_record({})
    FirehoseClient.instance.flush!
    api_request = @client.api_requests.first
    assert_equal :put_record_batch, api_request[:operation_name]
    data = JSON.parse(api_request[:params][:records].first[:data])
    assert_equal '"server-side"', data['device']
    assert_equal FirehoseClient::STREAM_NAME, api_request[:params][:delivery_stream_name]
  end
end
