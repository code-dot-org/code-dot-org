require 'minitest/autorun'
require 'rack/test'
require File.expand_path '../../../deployment', __FILE__
require File.expand_path '../../middleware/net_sim_api', __FILE__

ENV['RACK_ENV'] = 'test'

class NetSimApiTest < Minitest::Unit::TestCase

  def create_record(record)
    @net_sim_api.post "/v3/netsim/#{@shard_id}/#{@table_name}", record.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    @net_sim_api.last_response.location.split('/').last
  end

  def read_records
    @net_sim_api.get "/v3/netsim/#{@shard_id}/#{@table_name}"
    JSON.parse(@net_sim_api.last_response.body)
  end

  def update_record(id, record)
    @net_sim_api.put "/v3/netsim/#{@shard_id}/#{@table_name}/#{id}", record.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    JSON.parse(@net_sim_api.last_response.body)
  end

  def delete_record(id)
    @net_sim_api.delete "/v3/netsim/#{@shard_id}/#{@table_name}/#{id}"
  end

  def test_create_read_update_delete
    # The Tables API does not need to share a cookie jar with the Channels API.
    @channels = Rack::Test::Session.new(Rack::MockSession.new(ChannelsApi, "studio.code.org"))
    @net_sim_api = Rack::Test::Session.new(Rack::MockSession.new(NetSimApi, "studio.code.org"))
    @shard_id = '_testShard'
    @table_name = 'n' # for "node table"

    assert read_records.first.nil?

    begin
      record_id = create_record({name:'alice', age:7, male:false})
      record = read_records.first
      assert_equal record_id.to_i, record['id'].to_i
      assert_equal 'alice', record['name']
      assert_equal 7, record['age']
      assert_equal false, record['male']

      assert_equal 8, update_record(record_id, {id:record_id, age:8})['age']
      record = read_records.first
      assert_equal 8, record['age']
    ensure
      delete_record(record_id)
      assert read_records.first.nil?
    end
  end

end
