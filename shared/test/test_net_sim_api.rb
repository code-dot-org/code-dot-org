require 'minitest/autorun'
require 'rack/test'
require File.expand_path '../../../deployment', __FILE__
require File.expand_path '../../middleware/net_sim_api', __FILE__

ENV['RACK_ENV'] = 'test'

class NetSimApiTest < Minitest::Unit::TestCase

  def test_create_read_update_delete
    # The NetSim API does not need to share a cookie jar with the Channels API.
    @channels = Rack::Test::Session.new(Rack::MockSession.new(ChannelsApi, "studio.code.org"))
    @net_sim_api = Rack::Test::Session.new(Rack::MockSession.new(NetSimApi, "studio.code.org"))
    @shard_id = '_testShard'
    @table_name = 'n' # for "node table"

    assert read_records.first.nil?

    begin
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
      delete_record(record_id)
      assert read_records.first.nil?
    end
  end

  # Methods below this point are test utilities, not actual tests
  private

  def create_record(record)
    @net_sim_api.post "/v3/netsim/#{@shard_id}/#{@table_name}", record.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    JSON.parse(@net_sim_api.last_response.body)
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

end
