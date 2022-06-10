require 'mocha/mini_test'
require_relative 'test_helper'
require 'channels_api'
require 'tables_api'

class TablesTest < Minitest::Test
  include Rack::Test::Methods
  include SetupTest

  def build_rack_mock_session
    @session = Rack::MockSession.new(ChannelsApi.new(TablesApi), "studio.code.org")
  end

  def setup
    @table_name = '_testTable'
  end

  # channel id suffix, used by firebase in development and circleci environments
  TEST_SUFFIX = '-test-suffix'.freeze

  def test_firebase_export
    create_channel

    records_data = {
      '1' => '{"id":1,"name":"alice","age":7,"male":false}',
      '2' => '{"id":2,"name":"bob","age":8,"male":true}'
    }

    response = MiniTest::Mock.new
    response.expect(:body, records_data)

    firebase_path = "/v3/channels/#{@channel_id}#{TEST_SUFFIX}/storage/tables/#{@table_name}/records"
    Firebase::Client.any_instance.expects(:get).with(firebase_path).returns(response)

    expected_csv_data = "id,name,age,male\n1,alice,7,false\n2,bob,8,true\n"

    assert_equal export_firebase.body, expected_csv_data

    table_name_with_spaces = 'my%20table'

    response.expect(:body, records_data)
    firebase_path = "/v3/channels/#{@channel_id}#{TEST_SUFFIX}/storage/tables/#{table_name_with_spaces}/records"
    Firebase::Client.any_instance.expects(:get).with(firebase_path).returns(response)
    assert_equal export_firebase(table_name_with_spaces).body, expected_csv_data

    delete_channel
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

  def export_firebase(table_name = @table_name)
    CDO.stub(:firebase_name, 'my-firebase-name') do
      CDO.stub(:firebase_secret, 'my-firebase-secret') do
        CDO.stub(:firebase_channel_id_suffix, TEST_SUFFIX) do
          get "/v3/export-firebase-tables/#{@channel_id}/#{table_name}"
        end
      end
    end
  end
end
