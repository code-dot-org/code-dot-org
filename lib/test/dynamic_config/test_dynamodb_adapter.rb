require_relative '../test_helper'

require 'dynamic_config/adapters/dynamodb_adapter'

class DynamoDBAdapterTest < Minitest::Test
  def setup
    @client = Aws::DynamoDB::Client.new(stub_responses: true)
    Aws::DynamoDB::Client.stubs(:new).returns(@client)
    @adapter = DynamoDBAdapter.new('dcdo_test')
  end

  def test_all_passes_consistent_read
    @client.stub_responses(:scan, {items: [], count: 0, last_evaluated_key: nil})

    @adapter.all
    @adapter.all(consistent_read: true)

    scans = @client.api_requests.select {|r| r[:operation_name] == :scan}
    assert_equal([false, true], scans.map {|r| r[:params][:consistent_read]})
  end

  def test_all_continues_past_empty_page
    @client.stub_responses(
      :scan,
      [
        {items: [], count: 0, last_evaluated_key: {'data-key' => 'a'}},
        {items: [{'data-key' => 'b', 'data-value' => '1'}], count: 1, last_evaluated_key: nil},
      ]
    )

    assert_equal({'b' => 1}, @adapter.all)

    scans = @client.api_requests.select {|r| r[:operation_name] == :scan}
    assert_equal 2, scans.length
    assert_equal({'data-key' => {s: 'a'}}, scans.last[:params][:exclusive_start_key])
  end
end
