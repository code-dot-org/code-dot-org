require "test_helper"

class DatablockStorageControllerTest < ActionDispatch::IntegrationTest
  setup_all do
    @student = create :student

    project = create :project, owner: @student
    project.project_type = 'applab'
    project.save!
    @channel_id = project.channel_id
  end

  setup do
    sign_in @student
  end

  def _url(action)
    return "/datablock_storage/#{@channel_id}/#{action}"
  end

  def create_bob_record
    post _url(:create_record), params: {
      table_name: 'mytable',
      record_json: {"name" => 'bob', "age" => 8}.to_json,
    }
    assert_response :success
  end

  def read_records(table_name = 'mytable')
    get _url(:read_records), params: {
      table_name: table_name,
    }
    assert_response :success
    JSON.parse(@response.body).sort_by {|record| record[:id]}
  end

  def set_and_get_key_value(key, value)
    post _url(:set_key_value), params: {
      key: key,
      value: value.to_json,
    }
    assert_response :success
    get _url(:get_key_value), params: {
      key: key
    }
    assert_response :success
    val = JSON.parse(@response.body)
    assert_equal value, val
  end

  test "sets and gets string value" do
    set_and_get_key_value('key', 'val')
  end

  test "sets a number value" do
    set_and_get_key_value('key', 7)
  end

  test "sets and gets an undefined value" do
    set_and_get_key_value('key', nil)
  end

  test "sets and gets an emoji key and value" do
    set_and_get_key_value('👁️👄👁️', 'value is: 🎉')
  end

  test "set_key_value can't create more than MAX_NUM_KVPS kvps" do
    # Lower the max table count to 3 so its easy to test
    original_max_num_kvps = DatablockStorageKvp::MAX_NUM_KVPS
    DatablockStorageKvp.const_set(:MAX_NUM_KVPS, 3)

    # Create 3 kvps so we're right at the limit...
    set_and_get_key_value('key1', 'val1')
    set_and_get_key_value('key2', 'val2')
    set_and_get_key_value('key3', 'val3')

    post _url(:set_key_value), params: {key: 'key4', value: 'val4'.to_json}

    assert_response :bad_request
    assert_equal 'MAX_KVPS_EXCEEDED', JSON.parse(@response.body)['type']
  ensure
    DatablockStorageKvp.const_set(:MAX_NUM_KVPS, original_max_num_kvps)
  end

  test "set_key_value should enforce MAX_VALUE_LENGTH" do
    too_many_bees = 'b' * (DatablockStorageKvp::MAX_VALUE_LENGTH + 1) # 1 more 'b' char than max
    post _url(:set_key_value), params: {
      key: 'key',
      value: too_many_bees.to_json,
    }
    assert_response :bad_request

    assert_equal 'MAX_VALUE_LENGTH_EXCEEDED', JSON.parse(@response.body)['type']
  end

  test "creates a record" do
    post _url(:create_record), params: {
      table_name: 'mytable',
      record_json: {"name" => 'bob', "age" => 8}.to_json,
    }
    assert_response :success
    get _url(:read_records), params: {
      table_name: 'mytable',
    }
    assert_response :success
    val = JSON.parse(@response.body)
    assert_equal [{"name" => 'bob', "age" => 8, "id" => 1}], val
  end

  test "create_record creates a table if none exists" do
    get _url(:get_table_names)
    assert_response :success
    assert_equal [], JSON.parse(@response.body)

    create_bob_record

    get _url(:get_table_names)
    assert_response :success
    assert_equal ['mytable'], JSON.parse(@response.body)
  end

  test "create_record wont create objects or arrays" do
    create_bob_record

    post _url(:create_record), params: {
      table_name: 'mytable',
      record_json: '{"name": "badbob", "badval": {"key":"value"}}',
    }
    assert_response :bad_request
    assert_equal [{"name" => 'bob', "age" => 8, "id" => 1}], read_records

    post _url(:create_record), params: {
      table_name: 'mytable',
      record_json: '{"name": "badbob", "badval": [1,2,3]}',
    }
    assert_response :bad_request
    assert_equal [{"name" => 'bob', "age" => 8, "id" => 1}], read_records
  end

  test "create_record can't create more than MAX_TABLE_COUNT tables" do
    # Lower the max table count to 3 so it's easy to test
    original_max_table_count = DatablockStorageTable::MAX_TABLE_COUNT
    DatablockStorageTable.const_set(:MAX_TABLE_COUNT, 3)

    post _url(:create_record), params: {table_name: 'table1', record_json: {'name' => 'bob'}.to_json}
    assert_response :success

    post _url(:create_record), params: {table_name: 'table2', record_json: {'name' => 'bob'}.to_json}
    assert_response :success

    post _url(:create_record), params: {table_name: 'table3', record_json: {'name' => 'bob'}.to_json}
    assert_response :success

    post _url(:create_record), params: {table_name: 'table4', record_json: {'name' => 'bob'}.to_json}
    assert_response :bad_request
    assert_equal 'MAX_TABLES_EXCEEDED', JSON.parse(@response.body)['type']
  ensure
    DatablockStorageTable.const_set(:MAX_TABLE_COUNT, original_max_table_count)
  end

  test "create_record can't create more than MAX_TABLE_ROW_COUNT rows" do
    # Lower the max table count to 3 so its easy to test
    original_max_table_row_count = DatablockStorageTable::MAX_TABLE_ROW_COUNT
    DatablockStorageTable.const_set(:MAX_TABLE_ROW_COUNT, 3)

    # Create 3 records so we're right at the limit...
    create_bob_record
    create_bob_record
    create_bob_record

    post _url(:create_record), params: {table_name: 'mytable', record_json: {'name' => 'bob'}.to_json}

    assert_response :bad_request
    assert_equal 'MAX_ROWS_EXCEEDED', JSON.parse(@response.body)['type']
  ensure
    DatablockStorageTable.const_set(:MAX_TABLE_ROW_COUNT, original_max_table_row_count)
  end

  test "create_record can't create records over MAX_RECORD_LENGTH" do
    not_too_many_bees = 'b' * (DatablockStorageRecord::MAX_RECORD_LENGTH - 20) # 20 less 'b' chars than max
    post _url(:create_record), params: {table_name: 'mytable', record_json: {'name' => not_too_many_bees}.to_json}
    assert_response :success

    too_many_bees = 'b' * (DatablockStorageRecord::MAX_RECORD_LENGTH + 1) # 1 more 'b' char than max
    post _url(:create_record), params: {table_name: 'mytable', record_json: {'name' => too_many_bees}.to_json}
    assert_response :bad_request

    assert_equal 'MAX_RECORD_LENGTH_EXCEEDED', JSON.parse(@response.body)['type']
  end

  test "create_table" do
    get _url(:get_table_names)
    assert_response :success
    assert_equal [], JSON.parse(@response.body)

    post _url(:create_table), params: {table_name: 'mytable'}
    assert_response :success

    get _url(:get_table_names)
    assert_response :success
    assert_equal ['mytable'], JSON.parse(@response.body)

    get _url(:get_columns_for_table), params: {table_name: 'mytable'}
    assert_response :success
    assert_equal ['id'], JSON.parse(@response.body)
  end

  test "create_table with an emoji name" do
    post _url(:create_table), params: {table_name: '👁️👄👁️'}
    assert_response :success

    get _url(:get_table_names)
    assert_response :success
    assert_equal ['👁️👄👁️'], JSON.parse(@response.body)
  end

  test "create_table enforces max table_name length" do
    max_table_name_length = 700
    not_too_many_bees = 'b' * (max_table_name_length - 1) # 1 less 'b' chars than max
    post _url(:create_table), params: {table_name: not_too_many_bees}
    assert_response :success

    too_many_bees = 'b' * (max_table_name_length + 1) # 1 more 'b' char than max
    post _url(:create_table), params: {table_name: too_many_bees}
    assert_response :bad_request

    assert_equal 'TABLE_NAME_INVALID', JSON.parse(@response.body)['type']
  end

  test "get_key_values" do
    post _url(:set_key_value), params: {
      key: 'name',
      value: 'bob'.to_json,
    }
    assert_response :success
    post _url(:set_key_value), params: {
      key: 'age',
      value: 8.to_json,
    }
    assert_response :success

    get _url(:get_key_values)
    assert_response :success
    assert_equal ({"name" => 'bob', "age" => 8}), JSON.parse(@response.body)
  end

  test "delete_table" do
    post _url(:create_table), params: {table_name: 'mytable'}
    assert_response :success

    create_bob_record

    delete _url(:delete_table), params: {table_name: 'mytable'}
    assert_response :success

    get _url(:get_table_names)
    assert_response :success
    assert_equal [], JSON.parse(@response.body)

    assert_response :success
    get _url(:read_records), params: {table_name: 'mytable'}
    assert_response :bad_request
  end

  test "clear_table" do
    create_bob_record

    delete _url(:clear_table), params: {table_name: 'mytable'}
    assert_response :success

    # Rows should be gone
    get _url(:read_records), params: {table_name: 'mytable'}
    assert_response :success
    assert_equal [], JSON.parse(@response.body)

    # Columns should still be there
    get _url(:get_columns_for_table), params: {table_name: 'mytable'}
    assert_response :success
    assert_equal ['id', 'name', 'age'], JSON.parse(@response.body)
  end

  test "add_column" do
    post _url(:create_table), params: {table_name: 'mytable'}

    post _url(:add_column), params: {table_name: 'mytable', column_name: 'newcol'}
    assert_response :success

    get _url(:get_columns_for_table), params: {table_name: 'mytable'}
    assert_response :success
    assert_equal ['id', 'newcol'], JSON.parse(@response.body)
  end

  test "delete_column" do
    create_bob_record

    delete _url(:delete_column), params: {table_name: 'mytable', column_name: 'age'}
    assert_response :success

    get _url(:get_columns_for_table), params: {table_name: 'mytable'}
    assert_equal ['id', 'name'], JSON.parse(@response.body)

    # Make sure the 'age' key has been removed from JSON values too
    get _url(:read_records), params: {table_name: 'mytable'}
    assert_equal [{"name" => 'bob', "id" => 1}], JSON.parse(@response.body)
  end

  test "rename_column" do
    create_bob_record

    put _url(:rename_column), params: {
      table_name: 'mytable',
      old_column_name: 'name',
      new_column_name: 'first_name'
    }
    assert_response :success

    get _url(:get_columns_for_table), params: {table_name: 'mytable'}
    assert_equal ['id', 'first_name', 'age'], JSON.parse(@response.body)

    get _url(:read_records), params: {table_name: 'mytable'}
    assert_equal [{"first_name" => 'bob', "age" => 8, "id" => 1}], JSON.parse(@response.body)
  end

  test "rename_column creates a new column if the old column doesn't exist" do
    create_bob_record

    put _url(:rename_column), params: {
      table_name: 'mytable',
      old_column_name: 'nonexistent',
      new_column_name: 'newcol'
    }
    assert_response :success

    get _url(:get_columns_for_table), params: {table_name: 'mytable'}
    assert_equal ['id', 'name', 'age', 'newcol'], JSON.parse(@response.body)
  end

  test "get_column" do
    create_bob_record
    get _url(:get_column), params: {table_name: 'mytable', column_name: 'name'}
    assert_response :success
    val = JSON.parse(@response.body)
    assert_equal ['bob'], val
  end

  def create_record_where_foo_is(value)
    post _url(:create_record), params: {
      table_name: 'mytable',
      record_json: {"foo" => value}.to_json,
    }
    assert_response :success
  end

  def create_record_without_foo
    post _url(:create_record), params: {
      table_name: 'mytable',
      record_json: {}.to_json,
    }
    assert_response :success
  end

  test "coerce_column converts anything to string" do
    create_record_where_foo_is(1)
    create_record_where_foo_is('one')
    create_record_where_foo_is('1')
    create_record_where_foo_is(nil)
    create_record_without_foo
    create_record_where_foo_is(false)

    put _url(:coerce_column), params: {table_name: 'mytable', column_name: 'foo', column_type: 'string'}
    assert_response :success

    assert_equal [
      {"foo" => "1", "id" => 1},
      {"foo" => "one", "id" => 2},
      {"foo" => "1", "id" => 3},
      {"foo" => "null", "id" => 4},
      {"id" => 5},
      {"foo" => "false", "id" => 6},
    ], read_records
  end

  test "coerce_column converts valid booleans" do
    create_record_where_foo_is(true)
    create_record_where_foo_is('true')
    create_record_where_foo_is(false)
    create_record_where_foo_is('false')

    put _url(:coerce_column), params: {table_name: 'mytable', column_name: 'foo', column_type: 'boolean'}
    assert_response :success

    assert_equal [
      {"foo" => true, "id" => 1},
      {"foo" => true, "id" => 2},
      {"foo" => false, "id" => 3},
      {"foo" => false, "id" => 4},
    ], read_records
  end

  test "coerce_column converts valid numbers" do
    create_record_where_foo_is(1)
    create_record_where_foo_is('2')
    create_record_where_foo_is('1e3')
    create_record_where_foo_is('0.4')

    put _url(:coerce_column), params: {table_name: 'mytable', column_name: 'foo', column_type: 'number'}
    assert_response :success

    assert_equal [
      {"foo" => 1, "id" => 1},
      {"foo" => 2, "id" => 2},
      {"foo" => 1000, "id" => 3},
      {"foo" => 0.4, "id" => 4},
    ], read_records
  end

  test "coerce_column warns on invalid booleans" do
    create_record_where_foo_is(true)
    create_record_where_foo_is('bar')

    put _url(:coerce_column), params: {table_name: 'mytable', column_name: 'foo', column_type: 'boolean'}

    assert_response :bad_request
    assert_equal 'CANNOT_CONVERT_COLUMN_TYPE', JSON.parse(@response.body)['type']

    assert_equal [
      {"foo" => true, "id" => 1},
      {"foo" => 'bar', "id" => 2},
    ], read_records
  end

  test "coerce_column warns on invalid numbers" do
    create_record_where_foo_is(1)
    create_record_where_foo_is('2xyz')

    put _url(:coerce_column), params: {table_name: 'mytable', column_name: 'foo', column_type: 'number'}

    assert_response :bad_request
    assert_equal 'CANNOT_CONVERT_COLUMN_TYPE', JSON.parse(@response.body)['type']

    assert_equal [
      {"foo" => 1, "id" => 1},
      {"foo" => '2xyz', "id" => 2},
    ], read_records
  end

  POPULATE_TABLE_DATA_JSON_STRING = <<~JSON
    {
      "cities": [
        {"city": "Seattle", "state": "WA"},
        {"city": "Chicago", "state": "IL"}
      ]
    }
  JSON

  POPULATE_TABLE_DATA_RECORDS = [
    {"city" => "Seattle", "state" => "WA", "id" => 1},
    {"city" => "Chicago", "state" => "IL", "id" => 2},
  ]

  test "populate_tables" do
    put _url(:populate_tables), params: {tables_json: POPULATE_TABLE_DATA_JSON_STRING}
    assert_response :success

    assert_equal POPULATE_TABLE_DATA_RECORDS, read_records('cities')
  end

  test "populate_table does not overwrite existing data" do
    NYC_RECORD = {"city" => "New York", "state" => "NY", "id" => 1}

    post _url(:create_record), params: {
      table_name: 'cities',
      record_json: NYC_RECORD.to_json,
    }

    put _url(:populate_tables), params: {tables_json: POPULATE_TABLE_DATA_JSON_STRING}
    assert_response :success

    assert_equal [NYC_RECORD], read_records('cities')
  end

  test "populate_table prints a friendly error message when given bad table json" do
    BAD_JSON = '{'
    put _url(:populate_tables), params: {tables_json: BAD_JSON}
    assert_response :bad_request

    error = JSON.parse(@response.body)

    assert_match(/SyntaxError/, error['msg'])
    assert_match(/while parsing initial table data: {/, error['msg'])
  end

  test "populate_key_values" do
    put _url(:populate_key_values), params: {key_values_json: '{"click_count": 5}'}
    assert_response :success

    get _url(:get_key_values)
    assert_response :success
    assert_equal ({"click_count" => 5}), JSON.parse(@response.body)
  end

  test "populate_key_values_with_string_value" do
    put _url(:populate_key_values), params: {key_values_json: '{"click_count": "backends"}'}
    assert_response :success

    get _url(:get_key_values)
    assert_response :success
    assert_equal ({"click_count" => "backends"}), JSON.parse(@response.body)
  end

  test "populate_key_values does not overwrite existing data" do
    post _url(:set_key_value), params: {key: 'click_count', value: 1.to_json}
    assert_response :success

    put _url(:populate_key_values), params: {key_values_json: '{"click_count": 5}'}
    assert_response :success

    get _url(:get_key_values)
    assert_response :success

    assert_equal ({"click_count" => 1}), JSON.parse(@response.body)
  end

  test "populate_key_values prints a friendly error message when given bad key value json" do
    put _url(:populate_key_values), params: {key_values_json: '{'}

    assert_response :bad_request

    error = JSON.parse(@response.body)

    assert_match(/SyntaxError/, error['msg'])
    assert_match(/while parsing initial key\/value data: {/, error['msg'])
  end

  def create_shared_table
    expected_records = [
      {"id" => 1, "name" => "alice", "age" => 7},
      {"id" => 2, "name" => "bob", "age" => 8},
      {"id" => 3, "name" => "charlie", "age" => 9},
    ]

    mysharedtable = DatablockStorageTable.create!(
      project_id: DatablockStorageTable::SHARED_TABLE_PROJECT_ID,
      table_name: 'mysharedtable'
    )
    mysharedtable.create_records expected_records
    mysharedtable.save!

    return expected_records, mysharedtable
  end

  test "shared_table works with read_records" do
    expected_records, _mysharedtable = create_shared_table

    post _url(:add_shared_table), params: {table_name: 'mysharedtable'}
    assert_response :success

    assert_equal expected_records, read_records('mysharedtable')
  end

  test "shared_table copies on write when we create_record" do
    shared_records, mysharedtable = create_shared_table
    new_record = {"id" => 4, "name" => "anya", "age" => 10}

    post _url(:add_shared_table), params: {table_name: 'mysharedtable'}
    assert_response :success

    post _url(:create_record), params: {
      table_name: 'mysharedtable',
      record_json: new_record.to_json,
    }

    # We shouldn't modify the original copy of the shared table
    assert_equal shared_records.length, mysharedtable.records.count

    assert_equal shared_records + [new_record], read_records('mysharedtable')
  end

  test "shared_table copies on write when we delete_record" do
    shared_records, mysharedtable = create_shared_table

    post _url(:add_shared_table), params: {table_name: 'mysharedtable'}
    assert_response :success

    delete _url(:delete_record), params: {
      table_name: 'mysharedtable',
      record_id: 1,
    }
    assert_response :success

    # We shouldn't modify the original copy of the shared table
    assert_equal shared_records.length, mysharedtable.records.count

    assert_equal shared_records.drop(1), read_records('mysharedtable')
  end

  test "shared_table works with get_column" do
    _expected_records, _mysharedtable = create_shared_table

    post _url(:add_shared_table), params: {table_name: 'mysharedtable'}
    assert_response :success

    get _url(:get_column), params: {table_name: 'mysharedtable', column_name: 'name'}
    assert_response :success
    val = JSON.parse(@response.body)
    assert_equal ['alice', 'bob', 'charlie'], val
  end

  test "add_shared_table cannot overwrite an existing table" do
    _shared_records, _mysharedtable = create_shared_table

    post _url(:create_record), params: {
      table_name: 'mysharedtable',
      record_json: {"name" => 'bob', "age" => 8}.to_json,
    }
    assert_response :success

    post _url(:add_shared_table), params: {table_name: 'mysharedtable'}
    assert_response :bad_request

    error = JSON.parse(@response.body)
    assert_equal 'DUPLICATE_TABLE_NAME', error['type']

    assert_equal [{"id" => 1, "name" => 'bob', "age" => 8}], read_records('mysharedtable')
  end

  test "deletes a record" do
    post _url(:create_record), params: {
      table_name: 'mytable',
      record_json: {'name' => 'bob', 'age' => 8}.to_json,
    }
    assert_response :success
    # assert_equal 1, JSON.parse(@response.body).id
    assert_equal 1, @response.parsed_body['id']
    delete _url(:delete_record), params: {
      table_name: 'mytable',
      record_id: 1,
    }
    assert_response :success
    get _url(:read_records), params: {
      table_name: 'mytable',
    }
    assert_response :success
    val = JSON.parse(@response.body)
    assert_equal [], val
  end

  test "updates a record" do
    post _url(:create_record), params: {
      table_name: 'mytable',
      record_json: {'name' => 'bob', 'age' => 8}.to_json,
    }
    assert_response :success

    assert_equal 1, @response.parsed_body['id']
    put _url(:update_record), params: {
      table_name: 'mytable',
      record_id: 1,
      record_json: {'name' => 'sally', 'age' => 10}.to_json
    }
    assert_response :success
    get _url(:read_records), params: {
      table_name: 'mytable',
    }
    assert_response :success
    val = JSON.parse(@response.body)
    assert_equal [{'name' => 'sally', 'age' => 10, 'id' => 1}], val
  end

  test "import_csv" do
    csv_data = <<~CSV
      id,name,age,male
      4,alice,7,false
      5,bob,8,true
      6,charlie,9,true
    CSV

    expected_records = [
      {"id" => 1, "name" => "alice", "age" => 7, "male" => false},
      {"id" => 2, "name" => "bob", "age" => 8, "male" => true},
      {"id" => 3, "name" => "charlie", "age" => 9, "male" => true},
    ]

    post _url(:import_csv), params: {
      table_name: 'mytable',
      table_data_csv: csv_data,
    }
    assert_response :success

    assert_equal expected_records, read_records
  end

  test "import_csv overwrites existing data" do
    post _url(:create_record), params: {
      table_name: 'mytable',
      record_json: {"name" => 'tim', "age" => 2}.to_json,
    }
    assert_response :success

    csv_data = <<~CSV
      id,name
      1,alice
      2,bob
      3,charlie
    CSV

    expected_records = [
      {"id" => 1, "name" => "alice"},
      {"id" => 2, "name" => "bob"},
      {"id" => 3, "name" => "charlie"},
    ]

    post _url(:import_csv), params: {
      table_name: 'mytable',
      table_data_csv: csv_data,
    }
    assert_response :success

    # Tim, age 2 record should be gone:
    assert_equal expected_records, read_records
  end

  test "export csv" do
    csv_data = <<~CSV
      id,name,age,male
      1,alice,7,false
      2,bob,8,true
      3,charlie,9,true
    CSV

    post _url(:import_csv), params: {
      table_name: 'mytable',
      table_data_csv: csv_data,
    }
    assert_response :success

    get _url(:export_csv), params: {
      table_name: 'mytable',
    }
    assert_response :success

    assert_equal csv_data, @response.body
  end

  test "project_has_data" do
    get _url(:project_has_data)
    assert_response :success
    assert_equal false, JSON.parse(@response.body)

    create_bob_record

    get _url(:project_has_data)
    assert_response :success
    assert_equal true, JSON.parse(@response.body)

    delete _url(:delete_table), params: {
      table_name: 'mytable',
    }

    get _url(:project_has_data)
    assert_response :success
    assert_equal false, JSON.parse(@response.body)

    post _url(:set_key_value), params: {
      key: 'name',
      value: 'bob'.to_json,
    }

    get _url(:project_has_data)
    assert_response :success
    assert_equal true, JSON.parse(@response.body)

    delete _url(:delete_key_value), params: {
      key: 'name',
    }
    assert_response :success

    get _url(:project_has_data)
    assert_response :success
    assert_equal false, JSON.parse(@response.body)
  end

  test "clear_all_data" do
    create_bob_record
    set_and_get_key_value('somekey', 5)

    delete _url(:clear_all_data)
    assert_response :success

    get _url(:get_table_names)
    assert_response :success
    assert_equal [], JSON.parse(@response.body)

    get _url(:get_key_values)
    assert_response :success
    assert_equal({}, JSON.parse(@response.body))
  end
end
