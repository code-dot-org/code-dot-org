require 'minitest/autorun'
require 'rack/test'
require_relative '../../deployment'
require_relative '../middleware/net_sim_api'
require_relative 'fake_redis_client'
require_relative 'spy_pub_sub_api'

ENV['RACK_ENV'] = 'test'

class NetSimApiTest < Minitest::Unit::TestCase

  def setup
    # The NetSim API does not need to share a cookie jar with the Channels API.
    @channels = Rack::Test::Session.new(Rack::MockSession.new(ChannelsApi, "studio.code.org"))
    @net_sim_api = Rack::Test::Session.new(Rack::MockSession.new(NetSimApi, "studio.code.org"))
    @shard_id = '_testShard2'
    @table_name = 'n' # for "node table"

    # Never ever let tests hit the real Pusher API, even if our locals.yml says so.
    NetSimApi.override_pub_sub_api_for_test(SpyPubSubApi.new)

    # Always use a fake Redis.
    NetSimApi.override_redis_for_test(FakeRedisClient.new)

    # Every test should start with an empty table
    assert read_records.first.nil?, "Table was not empty"
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

  # Methods below this point are test utilities, not actual tests
  private

  def create_record(record)
    @net_sim_api.post "/v3/netsim/#{@shard_id}/#{@table_name}", record.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    JSON.parse(@net_sim_api.last_response.body)
  end

  def create_record_malformed(record)
    @net_sim_api.post "/v3/netsim/#{@shard_id}/#{@table_name}", '\\' + record.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    @net_sim_api.last_response
  end

  def read_records
    @net_sim_api.get "/v3/netsim/#{@shard_id}/#{@table_name}"
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
