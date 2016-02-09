require_relative 'test_helper'
require 'channels_api'
require 'tables_api'

class TablesTest < Minitest::Test
  include SetupTest

  def test_create_read_update_delete
    init_apis

    create_channel

    assert_nil read_records.first

    record_id = create_record({'name' => 'alice', 'age' => 7, 'male' => false})
    record = read_records.first
    assert_equal record_id.to_i, record['id'].to_i
    assert_equal 'alice', record['name']
    assert_equal 7, record['age']
    assert_equal false, record['male']

    assert_raises do
      record_id = create_record([{'name' => 'alice', 'age' => 7, 'male' => false}])
    end

    assert_equal 8, update_record(record_id, {'id' => record_id, 'age' => 8})['age']
    record = read_records.first
    assert_equal 8, record['age']

    delete_record(record_id)
    assert_nil read_records.first

    delete_channel
  end

  def test_populate
    init_apis
    create_channel

    data1 = {
      'table1' => [{'name'=> 'trevor'}, {'name'=>'alex'}],
      'table2' => [{'word'=> 'cow'}, {'word'=>'pig'}],
    }

    data2 = {
      'table1' => [{'city'=> 'SFO'}, {'city'=>'SEA'}],
      'table2' => [{'state'=> 'CA', 'country'=> 'USA'}, {'state'=>'MT', 'country'=> 'USA'}],
    }

    # Test basic populating
    populate_table(data1, true)

    @table_name = 'table1'
    records = read_records

    assert_equal records.first['name'], 'trevor'
    assert_equal records.length, 2

    @table_name = 'table2'
    records = read_records

    assert_equal records.first['word'], 'cow'
    assert_equal records.length, 2

    # Test overwrite off
    populate_table(data2, false)
    @table_name = 'table1'
    records = read_records

    assert_equal records.first['name'], 'trevor'
    assert_equal records.length, 2

    # Test overwrite on
    populate_table(data2, true)
    @table_name = 'table1'
    records = read_records

    assert_equal records.first['city'], 'SFO'

    @table_name = 'table2'
    records = read_records

    assert_equal records.last['country'], 'USA'

    delete_channel
  end

  def test_import
    init_apis
    create_channel

    # this record should not appear in the output
    create_record('name' => 'eve', 'age' => 9)

    csv_filename = File.expand_path('../roster.csv', __FILE__)
    import(csv_filename)

    records = read_records
    assert_equal 34, records.length
    assert_equal 'alice', records[0]['name']
    assert_equal 'bob', records[1]['name']

    delete_record(records[0]["id"])

    records = read_records
    assert_equal 33, records.length
    assert_equal 'bob', records[0]['name']

    # now reimport our file
    import(csv_filename)
    records = read_records
    assert_equal 34, records.length
    assert_equal 'alice', records[0]['name']

    delete_channel
  end

  def test_rename_column
    init_apis
    create_channel

    create_record('name' => 'trevor', 'age' => 30)
    create_record('name' => 'mitra', 'age' => 29)

    rename_column('name', 'first_name')
    records = read_records

    assert_equal 'trevor', records[0]['first_name']
    assert_nil records[1]['name']

    delete_channel
  end

  def test_delete_column
    init_apis
    create_channel

    create_record('name' => 'trevor', 'age' => 30)
    create_record('name' => 'mitra', 'age' => 29)

    delete_column('age')

    records = read_records
    assert_nil records[0]['age']
    assert_nil records[1]['age']

    delete_channel
  end

  def test_delete
    init_apis
    create_channel

    create_record('name' => 'trevor', 'age' => 30)
    create_record('name' => 'mitra', 'age' => 29)

    records = read_records
    assert_equal 2, records.length

    delete_table

    records = read_records

    assert_equal 0, records.length
    delete_channel
  end

  def test_export
    init_apis
    create_channel

    csv_filename = File.expand_path('../roster.csv', __FILE__)
    import(csv_filename)

    result_body = export().body.split("\n")
    original_body = File.read(csv_filename).split("\n")

    result_columns = result_body[0]
    original_columns = original_body[0]

    result_first_row = result_body[1]
    original_first_row = original_body[1]

    assert_equal result_columns, "id,#{original_columns}"
    assert_equal result_first_row, "1,#{original_first_row}"

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
    delete_table
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

  def export()
    @tables.get "/v3/export-shared-tables/#{@channel_id}/#{@table_name}"
  end

  def delete_column(column)
    @tables.delete "/v3/shared-tables/#{@channel_id}/#{@table_name}/column/#{column}"
  end

  def rename_column(old, new)
    @tables.post "/v3/shared-tables/#{@channel_id}/#{@table_name}/column/#{old}?new_name=#{new}"
  end

  def delete_table
    @tables.delete "/v3/shared-tables/#{@channel_id}/#{@table_name}"
  end

  def populate_table(data, overwrite)
    url = "/v3/shared-tables/#{@channel_id}"
    url += "?overwrite=1" if overwrite
    @tables.post url, JSON.generate(data), 'CONTENT_TYPE' => 'application/json;charset=utf-8'
  end

end
