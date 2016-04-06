require 'mocha/mini_test'
require_relative 'test_helper'
require 'channels_api'
require 'properties_api'

class PropertiesTest < Minitest::Test
  include Rack::Test::Methods
  include SetupTest

  def build_rack_mock_session
    @session = Rack::MockSession.new(ChannelsApi.new(PropertiesApi), "studio.code.org")
  end

  def setup
    create_channel
  end

  def teardown
    delete_channel
  end

  def test_get_set_delete
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
    assert last_response.not_found?
  end

  def test_set_too_large
    key = '_testKey'
    value_string = ("a" * 500000).to_json

    set_key_value(key, value_string)
    assert_equal 413, last_response.status
  end

  def test_auth
    set_key_value('k', 'v'.to_json)
    assert JSON.parse(list(self, @channel_id)).length == 1, "Owner can list all properties."

    # This mock of the PropertiesApi does not share cookies with @session.
    other_properties = Rack::Test::Session.new(Rack::MockSession.new(PropertiesApi, "studio.code.org"))

    list(other_properties, @channel_id)
    assert other_properties.last_response.unauthorized?, "Non-owner cannot list all properties."

    delete_key_value('k')
  end

  def test_multiset
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
  end

  def test_size_limit
    PropertiesApi.any_instance.stubs(:max_property_size).returns(20)
    key_length_10 = 'ABCDEFGHIJ'
    value_json_length_10 = '"abcdefgh"'
    value_json_length_11 = '"abcdefghi"'

    assert_equal(10, key_length_10.length)
    assert_equal(10, value_json_length_10.length)
    assert_equal(11, value_json_length_11.length)

    set_key_value(key_length_10, value_json_length_10)
    assert last_response.successful?, 'max-size property returns 200 OK'

    set_key_value(key_length_10, value_json_length_11)
    assert_equal 413, last_response.status, 'oversize property returns 413 Too Large'

    actual_value_json = get_key_value(key_length_10)
    assert_equal value_json_length_10, actual_value_json, 'oversized property is not written to storage'

    PropertiesApi.any_instance.unstub(:max_property_size)
  end

  # Methods below this line are test utilities, not actual tests
  private

  def create_channel
    post '/v3/channels', {}.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    @channel_id = last_response.location.split('/').last
  end

  def delete_channel
    delete "/v3/channels/#{@channel_id}"
    assert last_response.successful?
  end

  def set_key_value(key, value)
    post "/v3/shared-properties/#{@channel_id}/#{key}", value, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
  end

  def get_key_value(key)
    get "/v3/shared-properties/#{@channel_id}/#{key}"
    last_response.body
  end

  def delete_key_value(key)
    delete "/v3/shared-properties/#{@channel_id}/#{key}"
    assert last_response.successful?
  end

  def list(properties, channel_id)
    properties.get("/v3/shared-properties/#{channel_id}").body
  end

  def multiset(values, overwrite)
    url = "/v3/shared-properties/#{@channel_id}"
    url += "?overwrite=1" if overwrite

    post url, JSON.generate(values), 'CONTENT_TYPE' => 'application/json;charset=utf-8'
  end
end
