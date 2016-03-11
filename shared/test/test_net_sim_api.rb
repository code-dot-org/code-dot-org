require_relative 'test_helper'
require 'net_sim_api'
require_relative 'fake_redis_client'
require_relative 'spy_pub_sub_api'

class NetSimApiTest < Minitest::Test
  include SetupTest

  TABLE_NAMES = NetSimApi::TABLE_NAMES
  NODE_TYPES = NetSimApi::NODE_TYPES
  VALIDATION_ERRORS = NetSimApi::VALIDATION_ERRORS

  def setup
    # The NetSim API does not need to share a cookie jar with the Channels API.
    @channels = Rack::Test::Session.new(Rack::MockSession.new(ChannelsApi, 'studio.code.org'))
    @net_sim_api = Rack::Test::Session.new(Rack::MockSession.new(NetSimApi, 'studio.code.org'))
    @shard_id = '_testShard2'
    @table_name = 'test'

    # Never ever let tests hit the real Pusher API, even if our locals.yml says so.
    NetSimApi.override_pub_sub_api_for_test(SpyPubSubApi.new)

    # Always use a fake Redis.
    NetSimApi.override_redis_for_test(FakeRedisClient.new)

    # Every test should start with an empty table.
    assert read_records.first.nil?, 'Table did not begin empty'
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

    update_record_response = update_record(record_id, {name: 'alice', id: record_id, age: 8})
    assert_equal 8, JSON.parse(update_record_response.body)['age']
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

  def test_create_multiple_records
    created_ids = []
    # Sending any number of records as an array should result in an
    # array being returned
    record_create_response = create_record([{name: 'alice', age: 7, male: false}])
    assert record_create_response.is_a?(Array)
    assert_equal 1, record_create_response.length
    assert_equal 1, read_records.length
    created_ids.push(record_create_response[0]['id'])

    # Sending a record as a hash should result in a hash being returned
    record_create_response = create_record({name: 'fred', age: 12, male: true})
    assert record_create_response.is_a?(Hash)
    assert_equal 2, read_records.length
    created_ids.push(record_create_response['id'])

    # Sending several records should result in them all being inserted
    record_create_response = create_record([
      {name: 'nancy', age: 9, male: false},
      {name: 'drew', age: 11, male: true}
    ])
    assert record_create_response.is_a?(Array)
    assert_equal 2, record_create_response.length
    assert_equal 4, read_records.length
    created_ids.push(record_create_response[0]['id'])
    created_ids.push(record_create_response[1]['id'])

    # sending an empty array should be a no-op
    record_create_response = create_record([])
    assert record_create_response.is_a?(Array)
    assert_equal 0, record_create_response.length
    assert_equal 4, read_records.length

    # sending a value that is neither an array nor a hash should fail
    create_record(1)
    assert_equal 400, @net_sim_api.last_response.status
    assert_equal 4, read_records.length

    # sending an array containing a value that is neither an array nor a
    # hash should fail
    create_record([1])
    assert_equal 400, @net_sim_api.last_response.status
    assert_equal [VALIDATION_ERRORS[:malformed]], last_error_details
    assert_equal 4, read_records.length
  ensure
    created_ids.each { |id| delete_record(id) }
    assert read_records.first.nil?, 'Table was not empty'
  end

  def test_read_multiple_tables
    t1_row1 = create_record({name: 'rec1_1'}, 'table1')
    t1_row2 = create_record({name: 'rec1_2'}, 'table1')
    create_record({name: 'rec2_1'}, 'table2')
    t2_row2 = create_record({name: 'rec2_2'}, 'table2')
    create_record({name: 'rec3_1'}, 'table3')

    @net_sim_api.get "/v3/netsim/#{@shard_id}?t[]=table1&t[]=table2@2&t[]=table3@2"
    assert_equal 200, @net_sim_api.last_response.status

    result = JSON.parse(@net_sim_api.last_response.body)
    assert_equal(
        {'table1' => {'rows' => [t1_row1, t1_row2]},
         'table2' => {'rows' => [t2_row2]},
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
    assert_equal VALIDATION_ERRORS[:malformed], last_error_details

    # Verify that no record was created
    assert read_records.first.nil?, 'Table was not empty'
  end

  def test_get_400_on_inserting_orphaned_message
    create_message({fromNodeID: 1, toNodeID: 2, simulatedBy: 2})
    assert_equal 400, @net_sim_api.last_response.status, 'Orphaned message not created'
    assert_equal VALIDATION_ERRORS[:conflict], last_error_details
    assert_equal 0, read_records(TABLE_NAMES[:message]).count, 'Created no messages'
  end

  def test_get_400_on_inserting_duplicate_wire
    # The first one works
    create_wire(1, 2)
    assert_equal 201, @net_sim_api.last_response.status, 'Wire creation request failed'
    assert_equal 1, read_records(TABLE_NAMES[:wire]).count, 'Initial wire was not created'

    create_wire(1, 2)
    assert_equal 400, @net_sim_api.last_response.status, 'Duplicate wire request did not fail'
    assert_equal VALIDATION_ERRORS[:conflict], last_error_details
    assert_equal 1, read_records(TABLE_NAMES[:wire]).count, 'Duplicate wire was created'
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
    assert read_records.first.nil?, 'Table was not empty'
  end

  def test_get_404_on_updating_missing_record
    test_spy = SpyPubSubApi.new
    NetSimApi.override_pub_sub_api_for_test(test_spy)

    # Perform otherwise valid update on missing row
    record_update_response = update_record(1, {id: 1, age: 8})

    # Verify that the UPDATE response is a 404 NOT FOUND
    assert_equal 404, record_update_response.status

    # Verify that no invalidations were published
    assert_equal 0, test_spy.publish_history.length

    # Verify that no record was created
    assert read_records.first.nil?, 'Table was not empty'
  ensure
    delete_record(1)
    assert read_records.first.nil?, 'Table was not empty'
  end

  # Because calling delete on a missing object results in the desired
  # state anyway, we return a success code in this case - but no invalidation
  # should be produced.
  def test_get_204_on_deleting_missing_record
    test_spy = SpyPubSubApi.new
    NetSimApi.override_pub_sub_api_for_test(test_spy)

    # Perform otherwise valid update on missing row
    record_delete_response = delete_record(1)

    # Verify that the UPDATE response is a 404 NOT FOUND
    assert_equal 204, record_delete_response.status

    # Verify that no invalidations were published
    assert_equal 0, test_spy.publish_history.length

    # Verify that no record was created
    assert read_records.first.nil?, 'Table was not empty'
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
    assert read_records.first.nil?, 'Table was not empty'
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
    assert read_records.first.nil?, 'Table was not empty'
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
    assert read_records.first.nil?, 'Table was not empty'
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

    node_a = create_client_node(name: 'nodeA')
    node_b = create_client_node(name: 'nodeB')
    node_c = create_client_node(name: 'nodeC')

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
    assert read_records(TABLE_NAMES[:node]).first.nil?, 'Node table was not empty'
    assert read_records(TABLE_NAMES[:wire]).first.nil?, 'Wire table was not empty'
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

    node_a = create_client_node(name: 'nodeA')
    node_b = create_client_node(name: 'nodeB')

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
    assert read_records(TABLE_NAMES[:node]).first.nil?, 'Node table was not empty'
    assert read_records(TABLE_NAMES[:message]).first.nil?, 'Message table was not empty'
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
    node_a = create_client_node(name: 'nodeA')
    node_b = create_client_node(name: 'nodeB')
    node_c = create_client_node(name: 'nodeC')

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
    assert read_records(TABLE_NAMES[:wire]).first.nil?, 'Wire table was not empty'
    assert read_records(TABLE_NAMES[:message]).first.nil?, 'Message table was not empty'

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
    assert read_records(TABLE_NAMES[:node]).first.nil?, 'Node table was not empty'
    assert read_records(TABLE_NAMES[:wire]).first.nil?, 'Wire table was not empty'
    assert read_records(TABLE_NAMES[:message]).first.nil?, 'Message table was not empty'
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
    node_a = create_client_node(name: 'nodeA')
    node_b = create_client_node(name: 'nodeB')
    node_c = create_client_node(name: 'nodeC')
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
    assert read_records(TABLE_NAMES[:node]).first.nil?, 'Node table was not empty'
  end

  def test_parse_ids_from_query_string
    assert_equal([1, 3, 5], parse_ids_from_query_string('id[]=1&id[]=3&id[]=5'))
    assert_equal([2], parse_ids_from_query_string('id[]=nonsense&id[]=2'),
                 'Nonnumeric IDs should be ignored')
  end

  def test_can_only_insert_known_node_types
    # Allow client nodes
    create_node({}, NODE_TYPES[:client])
    assert_equal(201, @net_sim_api.last_response.status)

    # Allow router nodes
    create_node({'routerNumber' => 1}, NODE_TYPES[:router])
    assert_equal(201, @net_sim_api.last_response.status)

    # Reject nodes with other "types"
    create_node({}, 'some_random_type')
    assert_equal(400, @net_sim_api.last_response.status)
    assert_equal VALIDATION_ERRORS[:malformed], last_error_details

    # Reject nodes with no type
    create_node({})
    assert_equal(400, @net_sim_api.last_response.status)
    assert_equal VALIDATION_ERRORS[:malformed], last_error_details
  end

  def test_limit_shard_routers_to_max_routers
    CDO.netsim_max_routers.times do |i|
      create_router_node('routerNumber' => i)
      assert_equal 201, @net_sim_api.last_response.status
    end
    assert_equal(CDO.netsim_max_routers,
                 read_records(TABLE_NAMES[:node]).count,
                 "Didn't create #{CDO.netsim_max_routers} nodes")

    # We want the 21st node to fail
    create_router_node('routerNumber' => CDO.netsim_max_routers + 1)
    assert_equal(400, @net_sim_api.last_response.status,
                 "Went over router limit!")
    assert_equal(VALIDATION_ERRORS[:limit_reached], last_error_details)
    assert_equal(CDO.netsim_max_routers,
                 read_records(TABLE_NAMES[:node]).count,
                 "Went over router limit!")
  end

  def test_do_not_limit_shard_clients_to_max_routers
    CDO.netsim_max_routers.times do
      create_client_node
      assert_equal 201, @net_sim_api.last_response.status
    end
    assert_equal(CDO.netsim_max_routers,
                 read_records(TABLE_NAMES[:node]).count,
                 "Didn't create #{CDO.netsim_max_routers} nodes")

    # We want the 21st node to succeed
    create_client_node
    assert_equal(201, @net_sim_api.last_response.status,
                 "Should have allowed 21st client")
    assert_equal(CDO.netsim_max_routers + 1,
                 read_records(TABLE_NAMES[:node]).count,
                 "Should have allowed 21st client")
  end

  def test_having_max_routers_should_not_limit_clients
    CDO.netsim_max_routers.times do |i|
      create_router_node('routerNumber' => i)
      assert_equal 201, @net_sim_api.last_response.status
    end
    assert_equal CDO.netsim_max_routers,
                 read_records(TABLE_NAMES[:node]).count,
                 "Didn't create #{CDO.netsim_max_routers} nodes"

    # We are out of router spaces, but adding a client should be okay
    create_client_node
    assert_equal(201, @net_sim_api.last_response.status,
                 "Should have allowed 1st client")
    assert_equal(CDO.netsim_max_routers + 1,
                 read_records(TABLE_NAMES[:node]).count,
                 "Should have allowed 1st client")
  end

  def test_having_max_routers_of_clients_should_not_limit_routers
    CDO.netsim_max_routers.times do
      create_client_node
      assert_equal 201, @net_sim_api.last_response.status
    end
    assert_equal(CDO.netsim_max_routers,
                 read_records(TABLE_NAMES[:node]).count,
                 "Didn't create #{CDO.netsim_max_routers} nodes")

    # We should still be able to add a router
    create_router_node('routerNumber' => 1)
    assert_equal(201, @net_sim_api.last_response.status,
                 "Should have allowed 1st router")
    assert_equal(CDO.netsim_max_routers + 1,
                 read_records(TABLE_NAMES[:node]).count,
                 "Should have allowed 1st router")
  end

  def test_having_max_routers_on_one_shard_does_not_limit_another
    CDO.netsim_max_routers.times do |i|
      create_router_node('routerNumber' => i)
      assert_equal 201, @net_sim_api.last_response.status
    end
    assert_equal(CDO.netsim_max_routers,
                 read_records(TABLE_NAMES[:node]).count,
                 "Didn't create #{CDO.netsim_max_routers} nodes")

    # We should still be able to add a router on another shard
    @shard_id = '_testShard3'
    create_router_node('routerNumber' => CDO.netsim_max_routers + 1)
    assert_equal(201, @net_sim_api.last_response.status,
                 'Should have allowed router on another shard')
    assert_equal(1, read_records(TABLE_NAMES[:node]).count,
                 'Should have allowed router on another shard')
  end

  def test_reject_routers_without_router_number
    create_router_node({})
    assert_equal(400, @net_sim_api.last_response.status, "Allowed malformed router row")
    assert_equal(VALIDATION_ERRORS[:malformed], last_error_details)
  end

  def test_reject_routers_causing_router_number_collision
    create_router_node('routerNumber' => 1)
    assert_equal(201, @net_sim_api.last_response.status,
                 'Failed to insert first router.')

    # Should return 400 BAD REQUEST when a routerNumber collision is detected
    create_router_node('routerNumber' => 1)
    assert_equal(400, @net_sim_api.last_response.status,
                 'Should have rejected duplicate routerNumber')
    assert_equal(VALIDATION_ERRORS[:conflict], last_error_details)

    assert_equal(1, read_records(TABLE_NAMES[:node]).count,
                 'Expected to end up with one node.')
  end

  def test_allow_routers_with_different_router_numbers
    create_router_node('routerNumber' => 1)
    assert_equal(201, @net_sim_api.last_response.status,
                 'Failed to insert first router.')

    create_router_node('routerNumber' => 2)
    assert_equal(201, @net_sim_api.last_response.status,
                 'Failed to insert second router.')

    assert_equal(2, read_records(TABLE_NAMES[:node]).count,
                 'Expected to end up with two nodes.')
  end

  # Methods below this point are test utilities, not actual tests
  private

  def record_exists(table_name, record_id)
    @net_sim_api.get "/v3/netsim/#{@shard_id}/#{table_name}/#{record_id}"
    200 == @net_sim_api.last_response.status
  end

  def create_node(record, node_type = nil)
    record[:type] = node_type unless node_type.nil?
    create_record record, TABLE_NAMES[:node]
  end

  def create_client_node(record = {})
    create_node(record, NODE_TYPES[:client])
  end

  def create_router_node(record = {})
    create_node(record, NODE_TYPES[:router])
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
    @net_sim_api.last_response
  end

  def update_record_malformed(id, record)
    @net_sim_api.put "/v3/netsim/#{@shard_id}/#{@table_name}/#{id}", '\\' + record.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    @net_sim_api.last_response
  end

  def delete_record(id, table_name = @table_name)
    @net_sim_api.delete "/v3/netsim/#{@shard_id}/#{table_name}/#{id}"
    @net_sim_api.last_response
  end

  def last_error_details
    JSON.parse(@net_sim_api.last_response.body)['details']
  end

end
