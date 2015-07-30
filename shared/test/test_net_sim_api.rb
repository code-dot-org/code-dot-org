require 'minitest/autorun'
require 'rack/test'
require File.expand_path '../../../deployment', __FILE__
require File.expand_path '../../middleware/net_sim_api', __FILE__

ENV['RACK_ENV'] = 'test'

class NetSimApiTest < Minitest::Unit::TestCase

  TABLE_NAMES = NetSimApi::TABLE_NAMES

  def setup
    # The NetSim API does not need to share a cookie jar with the Channels API.
    @channels = Rack::Test::Session.new(Rack::MockSession.new(ChannelsApi, "studio.code.org"))
    @net_sim_api = Rack::Test::Session.new(Rack::MockSession.new(NetSimApi, "studio.code.org"))
    @shard_id = '_testShard'
    @table_name = TABLE_NAMES[:node] # for "node table"

    # Never ever let tests hit the real Pusher API, even if our locals.yml says so.
    NetSimApi.override_pub_sub_api_for_test(SpyPubSubApi.new)

    # Every test should start with an empty table
    assert read_records.first.nil?, "Table did not begin empty"
  end

  def test_create_read_update_delete
    # Verify that the CREATE response body and READ response bodies
    # both return the correct record values
    record_create_response = create_record({name: 'alice', age: 7, male: false})
    record_get_response = read_records.first
    assert_equal record_create_response['id'].to_i, record_get_response['id'].to_i
    assert_equal 'alice', record_get_response['name']
    assert_equal 'alice', record_create_response['name']
    assert_equal 7, record_get_response['age']
    assert_equal 7, record_create_response['age']
    assert_equal false, record_get_response['male']
    assert_equal false, record_create_response['male']

    record_id = record_get_response['id'].to_i

    assert_equal 8, update_record(record_id, {id: record_id, age: 8})['age']
    record = read_records.first
    assert_equal 8, record['age']
  ensure
    delete_record(record_id || 1)
    assert read_records.first.nil?, "Table was not empty"
  end

  def test_get_400_on_bad_json_insert
    # Send malformed JSON with an INSERT operation
    record_create_response = create_record_malformed({name: 'bob', age: 7, male: false})

    # Verify that the CREATE response is a 400 BAD REQUEST since we sent malformed JSON
    assert_equal 400, record_create_response.status

    # Verify that no record was created
    assert read_records.first.nil?, "Table was not empty"
  end

  def test_get_400_on_inserting_orphaned_message
    create_message({fromNodeID: 1, toNodeID: 2, simulatedBy: 2})
    assert_equal 400, @net_sim_api.last_response.status, "Orphaned message not created"
    assert_equal 0, read_records(TABLE_NAMES[:message]).count, "Created no messages"
  end

  def test_get_400_on_bad_json_update
    # Create a record correctly
    record_create_response = create_record({name: 'charles', age: 7, male: false})
    record_id = record_create_response['id'].to_i

    # Send malformed JSON with an UPDATE operation
    record_update_response = update_record_malformed(record_id, {id: record_id, age: 8})

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

    record_create_response = create_record({name: 'dave', age: 7, male: false})
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

    record_create_response = create_record({name: 'eliza', age: 7, male: false})
    record_id = record_create_response['id'].to_i
    update_record(record_id, {id: record_id, age: 8})

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

    record_create_response = create_record({name: 'franklin', age: 7, male: false})
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

  def test_publish_on_cascading_delete
    node_a = create_node({name: 'nodeA'})
    node_b = create_node({name: 'nodeB'})
    wire_ab = create_wire(node_a['id'], node_b['id'])
    message_b_to_a = create_message({fromNodeID: node_b['id'], toNodeID: node_a['id'], simulatedBy: node_a['id']})

    assert_equal 2, read_records(TABLE_NAMES[:node]).count, "Didn't create 2 nodes"
    assert_equal 1, read_records(TABLE_NAMES[:wire]).count, "Didn't create 1 wire"
    assert_equal 1, read_records(TABLE_NAMES[:message]).count, "Didn't create 1 message"

    test_spy = SpyPubSubApi.new
    NetSimApi.override_pub_sub_api_for_test(test_spy)

    delete_node(node_a['id'])

    assert_equal 3, test_spy.publish_history.length

    test_spy.publish_history.each do |history|
      assert_equal @shard_id, history[:channel]
    end

    wire_event, message_event, node_event = test_spy.publish_history

    assert_equal TABLE_NAMES[:wire], wire_event[:event]
    assert_equal 'delete_many', wire_event[:data][:action]
    assert_equal [wire_ab['id']], wire_event[:data][:ids]

    assert_equal TABLE_NAMES[:message], message_event[:event]
    assert_equal 'delete_many', message_event[:data][:action]
    assert_equal [message_b_to_a['id']], message_event[:data][:ids]

    assert_equal TABLE_NAMES[:node], node_event[:event]
    assert_equal 'delete', node_event[:data][:action]
    assert_equal node_a['id'], node_event[:data][:id]
  ensure
    delete_node(node_b['id'])
    assert read_records(TABLE_NAMES[:node]).empty?, "Node table was not empty"
    assert read_records(TABLE_NAMES[:wire]).empty?, "Wire table was not empty"
    assert read_records(TABLE_NAMES[:message]).empty?, "Message table was not empty"
  end

  def test_node_delete_cascades_to_node_wires

    node_a = create_node({name: 'nodeA'})
    node_b = create_node({name: 'nodeB'})
    node_c = create_node({name: 'nodeC'})

    wire_ab = create_wire(node_a['id'], node_b['id'])
    wire_ca = create_wire(node_c['id'], node_a['id'])
    wire_bc = create_wire(node_b['id'], node_c['id'])

    assert_equal 3, read_records(TABLE_NAMES[:node]).count, "Didn't create 3 nodes"
    assert_equal 3, read_records(TABLE_NAMES[:wire]).count, "Didn't create 3 wires"

    delete_node(node_a['id'])

    # Assert nodeA is gone
    assert !record_exists(TABLE_NAMES[:node], node_a['id'])

    # Assert wire AB and CA are gone
    assert !record_exists(TABLE_NAMES[:wire], wire_ab['id'])
    assert !record_exists(TABLE_NAMES[:wire], wire_ca['id'])

    # Assert node B and C are still there
    assert record_exists(TABLE_NAMES[:node], node_b['id'])
    assert record_exists(TABLE_NAMES[:node], node_c['id'])

    # Assert wire BC is still there
    assert record_exists(TABLE_NAMES[:wire], wire_bc['id'])
  ensure
    delete_node(node_a['id'])
    delete_node(node_b['id'])
    delete_node(node_c['id'])
    delete_wire(wire_ab['id'])
    delete_wire(wire_ca['id'])
    delete_wire(wire_bc['id'])
    assert read_records(TABLE_NAMES[:node]).first.nil?, "Node table was not empty"
    assert read_records(TABLE_NAMES[:wire]).first.nil?, "Wire table was not empty"
  end

  def test_node_delete_cascades_to_messages

    node_a = create_node({name: 'nodeA'})
    node_b = create_node({name: 'nodeB'})

    message_a_to_b = create_message({fromNodeID: node_a['id'], toNodeID: node_b['id'], simulatedBy: node_b['id']})
    message_b_to_a = create_message({fromNodeID: node_b['id'], toNodeID: node_a['id'], simulatedBy: node_a['id']})

    assert_equal 2, read_records(TABLE_NAMES[:node]).count, "Didn't create 2 nodes"
    assert_equal 2, read_records(TABLE_NAMES[:message]).count, "Didn't create 2 messages"

    delete_node(node_a['id'])

    # Assert nodeA is gone
    assert !record_exists(TABLE_NAMES[:node], node_a['id'])

    # Assert message from B to A is gone
    assert !record_exists(TABLE_NAMES[:message], message_b_to_a['id'])

    # Assert node B is still there
    assert record_exists(TABLE_NAMES[:node], node_b['id'])

    # Assert message from A to B is still there
    assert record_exists(TABLE_NAMES[:message], message_a_to_b['id'])
  ensure
    delete_node(node_a['id'])
    delete_node(node_b['id'])
    delete_message(message_a_to_b['id'])
    delete_message(message_b_to_a['id'])
    assert read_records(TABLE_NAMES[:node]).first.nil?, "Node table was not empty"
    assert read_records(TABLE_NAMES[:message]).first.nil?, "Message table was not empty"
  end

  # Methods below this point are test utilities, not actual tests
  private

  def record_exists(table_name, record_id)
    @net_sim_api.get "/v3/netsim/#{@shard_id}/#{table_name}/#{record_id}"
    200 == @net_sim_api.last_response.status
  end

  def create_node(record)
    create_record record, TABLE_NAMES[:node]
  end

  def delete_node(id)
    delete_record id, TABLE_NAMES[:node]
  end

  def create_wire(from_node_id, to_node_id)
    wire_record = {
      :localNodeID => from_node_id,
      :remoteNodeID => to_node_id
    }
    create_record wire_record, TABLE_NAMES[:wire]
  end

  def delete_wire(id)
    delete_record id, TABLE_NAMES[:wire]
  end

  def create_message(record)
    create_record record, TABLE_NAMES[:message]
  end

  def delete_message(id)
    delete_record id, TABLE_NAMES[:message]
  end

  def create_record(record, table_name = @table_name)
    @net_sim_api.post "/v3/netsim/#{@shard_id}/#{table_name}", record.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
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

  def delete_record(id, table_name = @table_name)
    @net_sim_api.delete "/v3/netsim/#{@shard_id}/#{table_name}/#{id}"
    @net_sim_api.last_response
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
