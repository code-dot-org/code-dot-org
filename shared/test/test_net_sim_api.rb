require 'minitest/autorun'
require 'rack/test'
require_relative '../../deployment'
require_relative '../middleware/net_sim_api'
require_relative 'fake_redis_client'
require_relative 'spy_pub_sub_api'

ENV['RACK_ENV'] = 'test'

class NetSimApiTest < Minitest::Test

  TABLE_NAMES = NetSimApi::TABLE_NAMES

  def setup
    # The NetSim API does not need to share a cookie jar with the Channels API.
    @channels = Rack::Test::Session.new(Rack::MockSession.new(ChannelsApi, "studio.code.org"))
    @net_sim_api = Rack::Test::Session.new(Rack::MockSession.new(NetSimApi, "studio.code.org"))
    @shard_id = '_testShard2'
    @table_name = TABLE_NAMES[:node]

    # Never ever let tests hit the real Pusher API, even if our locals.yml says so.
    NetSimApi.override_pub_sub_api_for_test(SpyPubSubApi.new)

    # Always use a fake Redis.
    NetSimApi.override_redis_for_test(FakeRedisClient.new)

    # Every test should start with an empty table.
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

    assert_equal 8, update_record(record_id, {name: 'alice', id: record_id, age: 8})['age']
    record = read_records.first
    assert_equal 8, record['age']

    # Test fetching starting from a minimum row id.
    # Add a another row to make thing slightly more interesting.
    create_record({name: 'bob'})

    url = "/v3/netsim/#{@shard_id}/#{@table_name}"
    records = read_records_for_url(url + "@#{record_id}")

    assert_equal 2, records.length
    assert_equal 'alice', records[0]['name']
    assert_equal 'bob', records[1]['name']
    record_id2 = records[1]['id']

    records = read_records_for_url(url + "@#{record_id2}")
    assert_equal 1, records.length
    assert_equal 'bob', records[0]['name']

    records = read_records_for_url(url + "@#{record_id2 + 1}")
    assert_equal 0, records.length
  ensure
    delete_record(record_id || 1)
    delete_record(record_id2 || 2)
    assert read_records.first.nil?, 'Table was not empty'
  end

  def test_read_multiple_tables
    create_record({name: 'rec1_1'}, 'table1')
    create_record({name: 'rec1_2'}, 'table1')
    create_record({name: 'rec2_1'}, 'table2')
    create_record({name: 'rec2_2'}, 'table2')
    create_record({name: 'rec3_1'}, 'table3')

    @net_sim_api.get "/v3/netsim/#{@shard_id}?t[]=table1&t[]=table2@2&t[]=table3@2"
    assert_equal 200, @net_sim_api.last_response.status

    result = JSON.parse(@net_sim_api.last_response.body)
    assert_equal(
        {'table1' => {'rows' => [{'name' => 'rec1_1', 'id' => 1},
                                 {'name' => 'rec1_2', 'id' => 2}]},
         'table2' => {'rows' => [{'name' => 'rec2_2', 'id' => 2}]},
         'table3' => {'rows' => []}},
        result)
  end

  def test_read_no_tables
    # Test that request no tables from a shard returns no results.
    @net_sim_api.get "/v3/netsim/#{@shard_id}"
    assert_equal 200, @net_sim_api.last_response.status
    assert_equal({}, JSON.parse(@net_sim_api.last_response.body))
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
    assert_equal [record_id], test_spy.publish_history.last[:data][:ids]
  ensure
    assert read_records.first.nil?, "Table was not empty"
  end

  def test_node_delete_cascades_to_node_wires_delete_one_delete_verb
    node_delete_cascades_to_node_wires do |node_id|
      @net_sim_api.delete "/v3/netsim/#{@shard_id}/#{TABLE_NAMES[:node]}/#{node_id}"
    end
  end

  def test_node_delete_cascades_to_node_wires_delete_one_post_verb
    node_delete_cascades_to_node_wires do |node_id|
      @net_sim_api.post "/v3/netsim/#{@shard_id}/#{TABLE_NAMES[:node]}/#{node_id}/delete"
    end
  end

  def test_node_delete_cascades_to_node_wires_delete_many_delete_verb
    node_delete_cascades_to_node_wires do |node_id|
      @net_sim_api.delete "/v3/netsim/#{@shard_id}/#{TABLE_NAMES[:node]}?id[]=#{node_id}"
    end
  end

  def test_node_delete_cascades_to_node_wires_delete_many_post_verb
    node_delete_cascades_to_node_wires do |node_id|
      @net_sim_api.post "/v3/netsim/#{@shard_id}/#{TABLE_NAMES[:node]}/delete?id[]=#{node_id}"
    end
  end

  def node_delete_cascades_to_node_wires

    node_a = create_node({name: 'nodeA'})
    node_b = create_node({name: 'nodeB'})
    node_c = create_node({name: 'nodeC'})

    wire_ab = create_wire(node_a['id'], node_b['id'])
    wire_ca = create_wire(node_c['id'], node_a['id'])
    wire_bc = create_wire(node_b['id'], node_c['id'])

    assert_equal 3, read_records(TABLE_NAMES[:node]).count, "Didn't create 3 nodes"
    assert_equal 3, read_records(TABLE_NAMES[:wire]).count, "Didn't create 3 wires"

    yield(node_a['id']) # Delete Node A using method provided by caller
    assert_equal 204, @net_sim_api.last_response.status

    # Assert nodeA is gone
    assert !record_exists(TABLE_NAMES[:node], node_a['id'])

    # Assert wire AB and CA are gone
    assert !record_exists(TABLE_NAMES[:wire], wire_ab['id'])

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

  def test_node_delete_cascades_to_messages_delete_one_delete_verb
    node_delete_cascades_to_messages do |node_id|
      @net_sim_api.delete "/v3/netsim/#{@shard_id}/#{TABLE_NAMES[:node]}/#{node_id}"
    end
  end

  def test_node_delete_cascades_to_messages_delete_one_post_verb
    node_delete_cascades_to_messages do |node_id|
      @net_sim_api.post "/v3/netsim/#{@shard_id}/#{TABLE_NAMES[:node]}/#{node_id}/delete"
    end
  end

  def test_node_delete_cascades_to_messages_delete_many_delete_verb
    node_delete_cascades_to_messages do |node_id|
      @net_sim_api.delete "/v3/netsim/#{@shard_id}/#{TABLE_NAMES[:node]}?id[]=#{node_id}"
    end
  end

  def test_node_delete_cascades_to_messages_delete_many_post_verb
    node_delete_cascades_to_messages do |node_id|
      @net_sim_api.post "/v3/netsim/#{@shard_id}/#{TABLE_NAMES[:node]}/delete?id[]=#{node_id}"
    end
  end

  def node_delete_cascades_to_messages

    node_a = create_node({name: 'nodeA'})
    node_b = create_node({name: 'nodeB'})

    message_a_to_b = create_message({fromNodeID: node_a['id'], toNodeID: node_b['id'], simulatedBy: node_b['id']})
    message_b_to_a = create_message({fromNodeID: node_b['id'], toNodeID: node_a['id'], simulatedBy: node_a['id']})

    assert_equal 2, read_records(TABLE_NAMES[:node]).count, "Didn't create 2 nodes"
    assert_equal 2, read_records(TABLE_NAMES[:message]).count, "Didn't create 2 messages"

    yield(node_a['id'])

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

  def test_many_node_delete_cascading_generates_minimum_invalidations_via_delete
    many_node_delete_cascading_generates_minimum_invalidations do |node_ids|
      query_string = node_ids.map{|id| "id[]=#{id}"}.join('&')
      @net_sim_api.delete "/v3/netsim/#{@shard_id}/#{TABLE_NAMES[:node]}?#{query_string}"
    end
  end

  def test_many_node_delete_cascading_generates_minimum_invalidations_via_post
    many_node_delete_cascading_generates_minimum_invalidations do |node_ids|
      query_string = node_ids.map{|id| "id[]=#{id}"}.join('&')
      @net_sim_api.post "/v3/netsim/#{@shard_id}/#{TABLE_NAMES[:node]}/delete?#{query_string}"
    end
  end

  def many_node_delete_cascading_generates_minimum_invalidations
    node_a = create_node({name: 'nodeA'})
    node_b = create_node({name: 'nodeB'})
    node_c = create_node({name: 'nodeC'})

    wire_ab = create_wire(node_a['id'], node_b['id'])
    wire_ac = create_wire(node_a['id'], node_c['id'])
    wire_ba = create_wire(node_b['id'], node_a['id'])
    wire_bc = create_wire(node_b['id'], node_c['id'])
    wire_ca = create_wire(node_c['id'], node_a['id'])
    wire_cb = create_wire(node_c['id'], node_b['id'])

    message_a_to_b = create_message({fromNodeID: node_a['id'], toNodeID: node_b['id'], simulatedBy: node_b['id']})
    message2_a_to_b = create_message({fromNodeID: node_a['id'], toNodeID: node_b['id'], simulatedBy: node_b['id']})
    message_b_to_a = create_message({fromNodeID: node_b['id'], toNodeID: node_a['id'], simulatedBy: node_a['id']})
    message2_b_to_a = create_message({fromNodeID: node_b['id'], toNodeID: node_a['id'], simulatedBy: node_a['id']})

    assert_equal 3, read_records(TABLE_NAMES[:node]).count, "Didn't create 3 nodes"
    assert_equal 6, read_records(TABLE_NAMES[:wire]).count, "Didn't create 6 wires"
    assert_equal 4, read_records(TABLE_NAMES[:message]).count, "Didn't create 4 messages"

    # Set up spy to count invalidations published by JUST the delete operation
    test_spy = SpyPubSubApi.new
    NetSimApi.override_pub_sub_api_for_test(test_spy)

    # Perform cascading multi-delete
    yield([node_a['id'], node_b['id']])

    # Assert nodes A and B are gone, but C is still there.
    assert !record_exists(TABLE_NAMES[:node], node_a['id'])
    assert !record_exists(TABLE_NAMES[:node], node_b['id'])
    assert record_exists(TABLE_NAMES[:node], node_c['id'])

    # Assert all wires and messages are gone
    assert read_records(TABLE_NAMES[:wire]).first.nil?, "Wire table was not empty"
    assert read_records(TABLE_NAMES[:message]).first.nil?, "Message table was not empty"

    # Even though we just deleted ten rows, there should only be three
    # published invalidations, because three tables were affected
    assert_equal(3, test_spy.publish_history.length)

    # In fact, the invalidations produce a very complete account of what was done.
    assert_equal(test_spy.publish_history[0],
                 {channel: @shard_id,
                  event: TABLE_NAMES[:wire],
                  data: {action: 'delete',
                         ids: [wire_ab['id'],
                               wire_ac['id'],
                               wire_ba['id'],
                               wire_bc['id'],
                               wire_ca['id'],
                               wire_cb['id']]}})

    assert_equal(test_spy.publish_history[1],
                 {channel: @shard_id,
                  event: TABLE_NAMES[:message],
                  data: {action: 'delete',
                         ids: [message_a_to_b['id'],
                               message2_a_to_b['id'],
                               message_b_to_a['id'],
                               message2_b_to_a['id']]}})

    assert_equal(test_spy.publish_history[2],
                 {channel: @shard_id,
                  event: TABLE_NAMES[:node],
                  data: {action: 'delete',
                         ids: [node_a['id'],
                               node_b['id']]}})

  ensure
    delete_node(node_a['id'])
    delete_node(node_b['id'])
    delete_node(node_c['id'])
    delete_wire(wire_ab['id'])
    delete_wire(wire_ac['id'])
    delete_wire(wire_ba['id'])
    delete_wire(wire_bc['id'])
    delete_wire(wire_ca['id'])
    delete_wire(wire_cb['id'])
    delete_message(message_a_to_b['id'])
    delete_message(message2_a_to_b['id'])
    delete_message(message_b_to_a['id'])
    delete_message(message2_b_to_a['id'])
    assert read_records(TABLE_NAMES[:node]).first.nil?, "Node table was not empty"
    assert read_records(TABLE_NAMES[:wire]).first.nil?, "Wire table was not empty"
    assert read_records(TABLE_NAMES[:message]).first.nil?, "Message table was not empty"
  end

  def test_parse_table_map_from_query_string
    assert_equal({'lobby' => 1, 'n' => 20, 'orders' => 100},
                 parse_table_map_from_query_string('t[]=lobby@1&t[]=n@20&t[]=orders@100&ignored=foo'))

    assert_equal({'n' => 0},
                 parse_table_map_from_query_string('t[]=n'),
                 'Unspecified version numbers should default to 0')

    assert_equal({'n' => 0},
                 parse_table_map_from_query_string('t[]=n@a'),
                 'Invalid version numbers should default to 0')

    assert_equal({}, parse_table_map_from_query_string(''))
  end

  def test_delete_many_delete_verb
    perform_test_delete_many do |query_string|
      @net_sim_api.delete "/v3/netsim/#{@shard_id}/#{TABLE_NAMES[:node]}?#{query_string}"
    end
  end

  def test_delete_many_post_verb
    perform_test_delete_many do |query_string|
      @net_sim_api.post "/v3/netsim/#{@shard_id}/#{TABLE_NAMES[:node]}/delete?#{query_string}"
    end
  end

  def perform_test_delete_many
    node_a = create_node({name: 'nodeA'})
    node_b = create_node({name: 'nodeB'})
    node_c = create_node({name: 'nodeC'})
    assert_equal 3, read_records(TABLE_NAMES[:node]).count, "Didn't create 3 nodes"

    query_string = [node_a['id'], node_c['id']].map { |id| "id[]=#{id}" }.join('&')
    yield query_string # Performs delete using block provided by caller
    assert_equal 204, @net_sim_api.last_response.status

    assert !record_exists(TABLE_NAMES[:node], node_a['id'])
    assert record_exists(TABLE_NAMES[:node], node_b['id'])
    assert !record_exists(TABLE_NAMES[:node], node_c['id'])

  ensure
    delete_node(node_a['id'])
    delete_node(node_b['id'])
    delete_node(node_c['id'])
    assert read_records(TABLE_NAMES[:node]).first.nil?, "Node table was not empty"
  end

  def test_parse_ids_from_query_string
    assert_equal([1, 3, 5], parse_ids_from_query_string('id[]=1&id[]=3&id[]=5'))
    assert_equal([2], parse_ids_from_query_string('id[]=nonsense&id[]=2'),
                 'Nonnumeric IDs should be ignored')
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
    read_records_for_url("/v3/netsim/#{@shard_id}/#{table_name}")
  end

  def read_records_for_url(url)
    @net_sim_api.get url
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
