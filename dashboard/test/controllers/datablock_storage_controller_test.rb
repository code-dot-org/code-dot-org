require "test_helper"

class DatablockStorageControllerTest < ActionDispatch::IntegrationTest
  setup do
    @student = create :student
    sign_in @student
    @level = create :applab
    user_storage_id = fake_storage_id_for_user_id(@student.id)
    channel_token = create :channel_token, level: @level, storage_id: user_storage_id
    @channel_id = channel_token.channel # calls storage_encrypt_channel_id(storage_id, project_id)
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
    skip "FIXME: create_record_where_foo_is(nil) and create_record_without_foo both fail"

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
    skip "FIXME: coerce_column does not return a warning, AND it modifies invalid booleans whereas it should leave them alone (stay as a string in this case)"

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
    skip "FIXME: coerce_column does not return a warning, AND it modifies invalid numbers whereas it should leave them alone (stay as a string in this case)"

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
    skip "FIXME: populate_tables is returning a 500, need to debug, expected behavior is to not return even a warning, and silently fail if the table already exists"

    NYC_RECORD = {"city" => "New York", "state" => "NY", "id" => 1}

    post _url(:create_record), params: {
      table_name: 'cities',
      record_json: NYC_RECORD.to_json,
    }

    put _url(:populate_tables), params: {table_data_json: POPULATE_TABLE_DATA_JSON_STRING}
    # Expected behavior: silently fail if the `cites` table already exists
    # Current behavior (wrong): 500 error
    assert_response :success

    assert_equal [NYC_RECORD], read_records('cities')
  end

  test "populate_table prints a friendly error message when given bad table json" do
    skip "FIXME: populate_tables is returning a 500, need to debug, expected behavior is to return a 400 with an error message"

    BAD_JSON = '{'
    put _url(:populate_tables), params: {table_data_json: BAD_JSON}
    assert_response :bad_request

    error = JSON.parse(@response.body)
    # Error message should be like (form the JS):
    # `${e}\nwhile parsing initial table data: ${jsonData}`
    assert_match(/SyntaxError/, error)
    assert_match(/while parsing initial table data: {/, error)
  end

  test "populate_key_values" do
    put _url(:populate_key_values), params: {key_values_json: '{"click_count": 5}'}
    assert_response :success

    get _url(:get_key_values)
    assert_response :success
    assert_equal ({"click_count" => 5}), JSON.parse(@response.body)
  end

  test "populate_key_values does not overwrite existing data" do
    skip "FIXME: populate_key_values is overwriting the existing key value"

    post _url(:set_key_value), params: {key: 'click_count', value: 1.to_json}
    assert_response :success

    put _url(:populate_key_values), params: {key_values_json: '{"click_count": 5}'}
    assert_response :success

    get _url(:get_key_values)
    assert_response :success
    assert_equal ({"click_count" => 1}), JSON.parse(@response.body)
  end

  test "populate_key_values prints a friendly error message when given bad key value json" do
    #     it('prints a friendly error message when given bad key value json', done => {
    #       FirebaseStorage.populateKeyValue(
    #         BAD_JSON,
    #         () => {
    #           throw 'expected JSON error to be reported';
    #         },
    #         validateError
    #       );
    #       function validateError(error) {
    #         expect(error).to.contain('SyntaxError');
    #         expect(error).to.contain('while parsing initial key/value data: {');
    #         done();
    #       }
    #     });
  end

  test "add_shared_table" do
    skip "FIXME: Not yet implemented"
    #   describe('copyStaticTable', () => {
    #     it('Copies the records and counters from shared channel', done => {
    #       const expectedTableData = {
    #         1: '{"id":1,"name":"alice","age":7,"male":false}',
    #         2: '{"id":2,"name":"bob","age":8,"male":true}',
    #         3: '{"id":3,"name":"charlie","age":9,"male":true}',
    #       };
    #       getSharedDatabase()
    #         .child('counters/tables/mytable')
    #         .set({lastId: 3, rowCount: 3});
    #       getSharedDatabase()
    #         .child('storage/tables/mytable/records')
    #         .set(expectedTableData);
    #       FirebaseStorage.copyStaticTable(
    #         'mytable',
    #         () => validateTableData(expectedTableData, done),
    #         () => {
    #           throw 'error';
    #         }
    #       );
    #     });
  end

  test "add_shared_table cannot overwrite an existing table" do
    skip "FIXME: Not yet implemented"
    #     it('Cannot overwrite an existing project table', done => {
    #       FirebaseStorage.createTable(
    #         'mytable',
    #         () => {
    #           FirebaseStorage.copyStaticTable(
    #             'mytable',
    #             () => {
    #               throw 'unexpectedly allowed to overwrite existing table';
    #             },
    #             error => {
    #               expect(error.type).to.equal(WarningType.DUPLICATE_TABLE_NAME);
    #               done();
    #             }
    #           );
    #         },
    #         () => {
    #           throw 'error';
    #         }
    #       );
    #     });
  end

  test "read_records works on a shared table" do
    skip "FIXME: Not yet implemented"
  end

  test "can't create more than maxTableCount tables" do
    skip "FIXME: Not yet implemented"
    #   it('cant create more than maxTableCount tables', done => {
    #     FirebaseStorage.createRecord(
    #       'table1',
    #       {name: 'bob'},
    #       createTable2,
    #       error => {
    #         throw error;
    #       }
    #     );
    #       FirebaseStorage.createRecord(
    #         'table2',
    #         {name: 'bob'},
    #         createTable3,
    #         error => {
    #           throw error;
    #         }
    #       );
    #       FirebaseStorage.createRecord(
    #         'table3',
    #         {name: 'bob'},
    #         createTable4,
    #         error => {
    #           throw error;
    #         }
    #       );
    #       FirebaseStorage.createRecord(
    #         'table4',
    #         {name: 'bob'},
    #         () => {
    #           throw 'unexpectedly allowed to create 4th table';
    #         },
    #         error => {
    #           expect(error.type).to.equal(WarningType.MAX_TABLES_EXCEEDED);
    #           done();
    #         }
    #       );

    #   });
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
    skip "FIXME: test will fail because import_csv doesn't cast values, see bottom of test"

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
    get _url(:read_records), params: {
      table_name: 'mytable',
    }
    assert_response :success
    val = JSON.parse(@response.body)

    # FIXME FIXME FIXME
    # this is /expected/ to fail currently because importCSV is not
    # casting values that can be JSON.parse()d, so everything is a string
    assert_equal expected_records, val
  end

  test "import_csv overwrites existing data" do
  end

  test "import_csv rejects long inputs" do
  end

  test "import_csv rejects too many rows" do
  end
end
