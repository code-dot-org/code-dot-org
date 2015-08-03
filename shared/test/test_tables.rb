require 'minitest/autorun'
require 'rack/test'
require File.expand_path '../../../deployment', __FILE__
require File.expand_path '../../middleware/channels_api', __FILE__
require File.expand_path '../../middleware/tables_api', __FILE__

ENV['RACK_ENV'] = 'test'

class TablesTest < Minitest::Test

  def test_create_read_update_delete
    init_apis

    create_channel

    assert read_records.first.nil?

    record_id = create_record({name: 'alice', age: 7, male: false})
    record = read_records.first
    assert_equal record_id.to_i, record['id'].to_i
    assert_equal 'alice', record['name']
    assert_equal 7, record['age']
    assert_equal false, record['male']

    assert_equal 8, update_record(record_id, {id: record_id, age: 8})['age']
    record = read_records.first
    assert_equal 8, record['age']

    delete_record(record_id)
    assert read_records.first.nil?

    delete_channel
  end

  def test_import
    init_apis
    create_channel

    # this record should not appear in the output
    create_record(name: 'eve', age: 9)

    csv_filename = File.expand_path('../roster.csv', __FILE__)
    import(csv_filename)

    records = read_records
    assert_equal 2, records.length
    assert_equal 'alice', records[0]['name']
    assert_equal 'bob', records[1]['name']

    delete_channel
  end

  # Methods below this line are test utilities, not actual tests
  private

  def init_apis
    # The Tables API does not need to share a cookie jar with the Channels API.
    @channels = Rack::Test::Session.new(Rack::MockSession.new(ChannelsApi, "studio.code.org"))
    @tables = Rack::Test::Session.new(Rack::MockSession.new(TablesApi, "studio.code.org"))
    @table_name = '_testTable'
  end

  def create_channel
    @channels.post '/v3/channels', {}.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    @channel_id = @channels.last_response.location.split('/').last
  end

  def delete_channel
    @channels.delete "/v3/channels/#{@channel_id}"
    assert @channels.last_response.successful?
  end

  def create_record(record)
    @tables.post "/v3/shared-tables/#{@channel_id}/#{@table_name}", record.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    @tables.last_response.location.split('/').last
  end

  def read_records
    @tables.get "/v3/shared-tables/#{@channel_id}/#{@table_name}"
    JSON.parse(@tables.last_response.body)
  end

  def update_record(id, record)
    @tables.put "/v3/shared-tables/#{@channel_id}/#{@table_name}/#{id}", record.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    JSON.parse(@tables.last_response.body)
  end

  def delete_record(id)
    @tables.delete "/v3/shared-tables/#{@channel_id}/#{@table_name}/#{id}"
  end

  def import(csv_filename)
    import_file = Rack::Test::UploadedFile.new csv_filename, "text/csv"
    @tables.post "/v3/import-shared-tables/#{@channel_id}/#{@table_name}", "import_file" => import_file
  end
end
