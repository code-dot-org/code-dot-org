require 'minitest/autorun'
require 'rack/test'
require File.expand_path '../../../deployment', __FILE__
require File.expand_path '../../middleware/net_sim_api', __FILE__

ENV['RACK_ENV'] = 'test'

class NetSimApiTest < Minitest::Unit::TestCase

  def setup
    # The NetSim API does not need to share a cookie jar with the Channels API.
    @channels = Rack::Test::Session.new(Rack::MockSession.new(ChannelsApi, "studio.code.org"))
    @net_sim_api = Rack::Test::Session.new(Rack::MockSession.new(NetSimApi, "studio.code.org"))
    @shard_id = '_testShard'
    @table_name = 'n' # for "node table"

    # Never ever let tests hit the real Pusher API, even if our locals.yml says so.
    NetSimApi.override_pub_sub_api_for_test(SpyPubSubApi.new)

    # Every test should start with an empty table
    assert read_records.first.nil?, "Table was not empty"
  end

  def test_create_read_update_delete
    # Verify that the CREATE response body and READ response bodies
    # both return the correct record values
    record_create_response = create_record({name:'alice', age:7, male:false})
    record_get_response = read_records.first
    assert_equal record_create_response['id'].to_i, record_get_response['id'].to_i
    assert_equal 'alice', record_get_response['name']
    assert_equal 'alice', record_create_response['name']
    assert_equal 7, record_get_response['age']
    assert_equal 7, record_create_response['age']
    assert_equal false, record_get_response['male']
    assert_equal false, record_create_response['male']

    record_id = record_get_response['id'].to_i

    assert_equal 8, update_record(record_id, {id:record_id, age:8})['age']
    record = read_records.first
    assert_equal 8, record['age']
  ensure
    delete_record(record_id || 1)
    assert read_records.first.nil?, "Table was not empty"
  end

  def test_get_400_on_bad_json_insert
    # Send malformed JSON with an INSERT operation
    record_create_response = create_record_malformed({name:'bob', age:7, male:false})

    # Verify that the CREATE response is a 400 BAD REQUEST since we sent malformed JSON
    assert_equal 400, record_create_response.status

    # Verify that no record was created
    assert read_records.first.nil?, "Table was not empty"
  end

  def test_get_400_on_bad_json_update
    # Create a record correctly
    record_create_response = create_record({name:'charles', age:7, male:false})
    record_id = record_create_response['id'].to_i

    # Send malformed JSON with an UPDATE operation
    record_update_response = update_record_malformed(record_id, {id:record_id, age:8})

    # Verify that the UPDATE response is a 400 BAD REQUEST since we sent malformed JSON
    assert_equal 400, record_update_response.status

    # Verify that the record was not changed
    record = read_records.first
    assert_equal 7, record['age']
  ensure
    delete_record(record_id || 1)
    assert read_records.first.nil?, "Table was not empty"
  end

  def test_no_publish_on_read
    test_spy = SpyPubSubApi.new
    NetSimApi.override_pub_sub_api_for_test(test_spy)

    read_records

    assert test_spy.publish_history.empty?
  end

  def test_publish_on_insert
    test_spy = SpyPubSubApi.new
    NetSimApi.override_pub_sub_api_for_test(test_spy)

    record_create_response = create_record({name:'dave', age:7, male:false})
    record_id = record_create_response['id'].to_i

    assert_equal 1, test_spy.publish_history.length
    assert_equal @shard_id, test_spy.publish_history.first[:channel]
    assert_equal @table_name, test_spy.publish_history.first[:event]
    assert_equal 'insert', test_spy.publish_history.first[:data][:action]
    assert_equal record_id, test_spy.publish_history.first[:data][:id]
  ensure
    delete_record(record_id || 1)
    assert read_records.first.nil?, "Table was not empty"
  end

  def test_publish_on_update
    test_spy = SpyPubSubApi.new
    NetSimApi.override_pub_sub_api_for_test(test_spy)

    record_create_response = create_record({name:'eliza', age:7, male:false})
    record_id = record_create_response['id'].to_i
    update_record(record_id, {id:record_id, age:8})

    assert_equal 2, test_spy.publish_history.length
    assert_equal @shard_id, test_spy.publish_history.last[:channel]
    assert_equal @table_name, test_spy.publish_history.last[:event]
    assert_equal 'update', test_spy.publish_history.last[:data][:action]
    assert_equal record_id, test_spy.publish_history.last[:data][:id]
  ensure
    delete_record(record_id || 1)
    assert read_records.first.nil?, "Table was not empty"
  end

  def test_publish_on_delete
    test_spy = SpyPubSubApi.new
    NetSimApi.override_pub_sub_api_for_test(test_spy)

    record_create_response = create_record({name:'franklin', age:7, male:false})
    record_id = record_create_response['id'].to_i
    delete_record(record_id)

    assert_equal 2, test_spy.publish_history.length
    assert_equal @shard_id, test_spy.publish_history.last[:channel]
    assert_equal @table_name, test_spy.publish_history.last[:event]
    assert_equal 'delete', test_spy.publish_history.last[:data][:action]
    assert_equal record_id, test_spy.publish_history.last[:data][:id]
  ensure
    assert read_records.first.nil?, "Table was not empty"
  end

  def test_node_delete_cascades_to_node_wires

    nodeA = create_node({name:'nodeA'})
    nodeB = create_node({name:'nodeB'})
    nodeC = create_node({name:'nodeC'})

    wireAB = create_wire(nodeA['id'], nodeB['id'])
    wireCA = create_wire(nodeC['id'], nodeA['id'])
    wireBC = create_wire(nodeB['id'], nodeC['id'])

    assert_equal 3, read_records('n').count, "Didn't create 3 nodes"
    assert_equal 3, read_records('w').count, "Didn't create 3 wires"

    delete_node(nodeA['id'])

    # Assert nodeA is gone
    assert !record_exists('n', nodeA['id'])

    # Assert wire AB and CA are gone
    assert !record_exists('w', wireAB['id'])
    assert !record_exists('w', wireCA['id'])

    # Assert node B and C are still there
    assert record_exists('n', nodeB['id'])
    assert record_exists('n', nodeC['id'])

    # Assert wire BC is still there
    assert record_exists('w', wireBC['id'])
  ensure
    delete_node(nodeA['id'])
    delete_node(nodeB['id'])
    delete_node(nodeC['id'])
    delete_wire(wireAB['id'])
    delete_wire(wireCA['id'])
    delete_wire(wireBC['id'])
    assert read_records('n').first.nil?, "Node table was not empty"
    assert read_records('w').first.nil?, "Wire table was not empty"
  end

  # Methods below this point are test utilities, not actual tests
  private

  def record_exists(table_name, record_id)
    @net_sim_api.get "/v3/netsim/#{@shard_id}/#{@table_name}"
    200 == @net_sim_api.last_response.status
  end

  def create_node(record)
    @net_sim_api.post "/v3/netsim/#{@shard_id}/n", record.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    JSON.parse(@net_sim_api.last_response.body)
  end

  def delete_node(id)
    @net_sim_api.delete "/v3/netsim/#{@shard_id}/n/#{id}"
  end

  def create_wire(from_node_id, to_node_id)
    wire_record = {
      :localNodeID => from_node_id,
      :remoteNodeID => to_node_id
    }
    @net_sim_api.post "/v3/netsim/#{@shard_id}/w", wire_record.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    JSON.parse(@net_sim_api.last_response.body)
  end

  def delete_wire(id)
    @net_sim_api.delete "/v3/netsim/#{@shard_id}/w/#{id}"
  end

  def create_record(record)
    @net_sim_api.post "/v3/netsim/#{@shard_id}/#{@table_name}", record.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    JSON.parse(@net_sim_api.last_response.body)
  end

  def create_record_malformed(record)
    @net_sim_api.post "/v3/netsim/#{@shard_id}/#{@table_name}", '\\' + record.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    @net_sim_api.last_response
  end

  def read_records(table_name = @table_name)
    @net_sim_api.get "/v3/netsim/#{@shard_id}/#{table_name}"
    JSON.parse(@net_sim_api.last_response.body)
  end

  def update_record(id, record)
    @net_sim_api.put "/v3/netsim/#{@shard_id}/#{@table_name}/#{id}", record.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    JSON.parse(@net_sim_api.last_response.body)
  end

  def update_record_malformed(id, record)
    @net_sim_api.put "/v3/netsim/#{@shard_id}/#{@table_name}/#{id}", '\\' + record.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    @net_sim_api.last_response
  end

  def delete_record(id)
    @net_sim_api.delete "/v3/netsim/#{@shard_id}/#{@table_name}/#{id}"
  end

end

# Test-only pub/sub API that sense whether events have been published without
# actually contacting a remote service.
class SpyPubSubApi
  attr_reader :publish_history

  def initialize
    @publish_history = []
  end

  # Pretends to publish an event to a a channel using the Pub/Sub system.
  #
  # @param [String] channel a single channel name that the event is to be published on
  # @param [String] event - the name of the event to be triggered
  # @param [Hash] data - the data to be sent with the event
  def publish(channel, event, data)
    @publish_history.push({ :channel => channel, :event => event, :data => data })
  end
end
