require 'minitest/autorun'
require 'rack/test'
require File.expand_path '../../../deployment', __FILE__
require File.expand_path '../../middleware/channels_api', __FILE__
require File.expand_path '../../middleware/properties_api', __FILE__

ENV['RACK_ENV'] = 'test'

class PropertiesTest < Minitest::Test

  def init_api
    # The Properties API does not need to share a cookie jar with the Channels API.
    @channels = Rack::Test::Session.new(Rack::MockSession.new(ChannelsApi, "studio.code.org"))
    @properties = Rack::Test::Session.new(Rack::MockSession.new(PropertiesApi, "studio.code.org"))
  end

  def test_get_set_delete
    init_api
    create_channel

    key = '_testKey'
    value_string = "one".to_json
    value_num = 2.to_json
    value_boolean = true.to_json

    set_key_value(key, value_string)
    assert_equal value_string, get_key_value(key)

    set_key_value(key, value_num)
    assert_equal value_num, get_key_value(key)

    set_key_value(key, value_boolean)
    assert_equal value_boolean, get_key_value(key)

    delete_key_value(key)

    get_key_value(key)
    assert @properties.last_response.not_found?

    delete_channel
  end

  def test_multiset
    init_api
    create_channel

    # Basic multi-setting
    data = {
      'a' => 1,
      'b' => ['a', 'b'],
      'c' => 'string'
    }
    multiset(data, false)
    data.each do |k, v|
      assert_equal v.to_json, get_key_value(k)
    end

    # Test overwrite off
    data2 = {
      'a' => 2,
      'b' => ['c', 'b'],
      'c' => 'yo'
    }
    multiset(data2, false)
    data.each do |k, v|
      assert_equal v.to_json, get_key_value(k)
    end

    # Test overwrite on
    multiset(data2, true)
    data2.each do |k, v|
      assert_equal v.to_json, get_key_value(k)
    end

    delete_channel
  end

  # Methods below this line are test utilities, not actual tests
  private

  def create_channel
    @channels.post '/v3/channels', {}.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    @channel_id = @channels.last_response.location.split('/').last
  end

  def delete_channel
    @channels.delete "/v3/channels/#{@channel_id}"
    assert @channels.last_response.successful?
  end

  def set_key_value(key, value)
    @properties.post "/v3/shared-properties/#{@channel_id}/#{key}", value, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
  end

  def get_key_value(key)
    @properties.get "/v3/shared-properties/#{@channel_id}/#{key}"
    @properties.last_response.body
  end

  def delete_key_value(key)
    @properties.delete "/v3/shared-properties/#{@channel_id}/#{key}"
    assert @properties.last_response.successful?
  end

  def multiset(values, overwrite)
    url = "/v3/shared-properties/#{@channel_id}"
    url += "?overwrite=1" if overwrite

    @properties.post url, JSON.generate(values), 'CONTENT_TYPE' => 'application/json;charset=utf-8'
  end
end
