require_relative '../test_helper'
require 'fakeredis'
require 'cdo/redis'

class RedisTest < Minitest::Test
  def stub_dcdo(flag)
    DCDO.stubs(:get).with("redis", false).returns(flag)
  end

  def unstub_dcdo
    DCDO.unstub(:get)
  end

  def setup
    RedisClient.log = Logger.new('/dev/null')
    stub_dcdo(true)
    @client = RedisClient.client = Redis.new
    @stream = :i18n
    @stream_name = RedisClient::STREAMS[@stream]
    RedisClient.instance.flush!
  end

  def teardown
    # Clear out any state in the client.
    RedisClient.instance.flush!
    RedisClient.client = nil
    unstub_dcdo
  end

  def test_redis_single_record
    record = {
      url: 'http://studio.code.org/courses',
      string_key: 'home.heading_elementary_markdown'
    }
    RedisClient.instance.put_record(@stream, record)
    RedisClient.instance.flush!
    popped_record = JSON.parse(@client.lpop(@stream_name))
    assert_equal record[:url], popped_record["url"]
    assert_equal record[:string_key], popped_record["string_key"]
    assert_equal '"server-side"', popped_record['device']
  end

  def test_redis_with_multiple_streams
    record = {
      url: 'http://studio.code.org/courses',
      string_key: 'home.heading_elementary_markdown'
    }
    RedisClient::STREAMS.each do |stream, _|
      RedisClient.instance.put_record(stream, record)
    end
    RedisClient.instance.flush!

    RedisClient::STREAMS.each do |_, stream_name|
      popped_record = JSON.parse(@client.lpop(stream_name))
      assert_equal record[:url], popped_record["url"]
      assert_equal record[:string_key], popped_record["string_key"]
      assert_equal '"server-side"', popped_record['device']
    end
  end

  # Ensure appending multiple records in Redis works as expected
  def test_redis_multiple_records
    record1 = {
      url: 'http://studio.code.org/courses',
      string_key: 'home.heading_elementary_markdown'
    }
    record2 = {
      url: 'test',
      string_key: 'test'
    }
    RedisClient.instance.put_record(@stream, record1)
    RedisClient.instance.put_record(@stream, record2)
    RedisClient.instance.flush!

    popped_record = JSON.parse(@client.lpop(@stream_name))
    assert_equal record1[:url], popped_record["url"]
    assert_equal record1[:string_key], popped_record["string_key"]
    assert_equal '"server-side"', popped_record['device']

    popped_record = JSON.parse(@client.lpop(@stream_name))
    assert_equal record2[:url], popped_record["url"]
    assert_equal record2[:string_key], popped_record["string_key"]
    assert_equal '"server-side"', popped_record['device']
  end
end
