require 'test_helper'

class ContactRollupsProcessedTest < ActiveSupport::TestCase
  test 'import_from_raw_table creates one row per email' do
    assert 0, ContactRollupsRaw.count
    assert 0, ContactRollupsProcessed.count

    # Create 6 records for 3 unique emails
    create :contact_rollups_raw, email: 'email1@example.domain'
    create_list :contact_rollups_raw, 2, email: 'email2@example.domain'
    create_list :contact_rollups_raw, 3, email: 'email3@example.domain'

    ContactRollupsProcessed.import_from_raw_table

    # Note: having unique email addresses is already guaranteed by table constraint
    assert_equal 3, ContactRollupsProcessed.count
  end

  test 'import_from_raw_table inserts records by batch' do
    unique_email_count = 15
    batch_sizes = [1, 5, 7, 11, 20]

    ContactRollupsRaw.delete_all
    create_list :contact_rollups_raw, unique_email_count

    batch_sizes.each do |batch_size|
      ContactRollupsProcessed.delete_all
      ContactRollupsProcessed.import_from_raw_table(batch_size)
      assert_equal unique_email_count, ContactRollupsProcessed.count, "Failed with batch size of #{batch_size}"
    end
  end

  test 'import_from_raw_table combines data from multiple records' do
    assert 0, ContactRollupsRaw.count
    assert 0, ContactRollupsProcessed.count

    base_time = Time.now.utc
    email = 'email@example.domain'
    create :contact_rollups_raw, email: email,
      data: nil, data_updated_at: base_time - 1.day
    create :contact_rollups_raw, email: email,
      sources: 'dashboard.email_preferences', data: {opt_in: 1}, data_updated_at: base_time

    ContactRollupsProcessed.import_from_raw_table

    assert_equal 1, ContactRollupsProcessed.count
    data = ContactRollupsProcessed.first.data
    assert_equal 1, data['opt_in']
    assert_equal base_time.to_i, Time.parse(data['updated_at']).to_i
  end

  test 'import_from_raw_table calls all extraction functions' do
    assert 0, ContactRollupsRaw.count
    create :contact_rollups_raw

    # Each extraction function will be called once per unique email address
    ContactRollupsProcessed.expects(:extract_field).once
    ContactRollupsProcessed.expects(:extract_updated_at).once

    ContactRollupsProcessed.import_from_raw_table
  end

  test 'extract_field' do
    table = 'dashboard.email_preferences'
    field = 'opt_in'

    test_cases = [
      {input: [{}, nil, nil], expected_output: nil},
      {input: [{table => {}}, table, field], expected_output: nil},
      {input: [{'dashboard.another_table' => {opt_in: 1}}, table, field], expected_output: nil},
      {input: [{table => {'opt_in' => 0}}, table, field], expected_output: {opt_in: 0}},
      {input: [{table => {'opt_in' => 1}}, table, field], expected_output: {opt_in: 1}},
      {input: [{table => {'opt_in' => nil}}, table, field], expected_output: {opt_in: nil}}
    ]

    test_cases.each_with_index do |test, index|
      output = ContactRollupsProcessed.extract_field(*test[:input])
      assert_equal test[:expected_output], output, "Test index #{index} failed"
    end
  end

  test 'extract_updated_at' do
    base_time = Time.now.utc - 7.days
    tests = [
      {
        input: {'table1' => {'data_updated_at' => base_time}},
        expected_output: {updated_at: base_time}
      },
      {
        input: {
          'table1' => {'data_updated_at' => base_time - 1.day},
          'table2' => {'data_updated_at' => base_time + 1.day},
          'table3' => {'data_updated_at' => base_time},
        },
        expected_output: {updated_at: base_time + 1.day}
      }
    ]

    # Test valid inputs
    tests.each_with_index do |test, index|
      output = ContactRollupsProcessed.extract_updated_at(test[:input])
      assert_equal test[:expected_output], output, "Test index #{index} failed"
    end

    # Test invalid input
    assert_raise StandardError do
      ContactRollupsProcessed.extract_updated_at({'table' => {}})
    end
  end

  test 'parse_contact_data parses valid input' do
    time_str = '2020-03-11 15:01:26'
    time_parsed = Time.find_zone('UTC').parse(time_str)
    format_values = {
      sources_key: ContactRollupsProcessed::SOURCES_KEY,
      data_key: ContactRollupsProcessed::DATA_KEY,
      data_updated_at_key: ContactRollupsProcessed::DATA_UPDATED_AT_KEY,
      time_str: time_str
    }

    # Test inputs are JSON strings.
    # Use string +format+ method so we don't have to escape every double quotes.
    # Example of a JSON string test: "[{\"s\": \"table1\", \"d\": null, \"u\": \"2020-03-11 15:01:26\"}]"
    tests = [
      {
        input: format(
          '[{"%{sources_key}": "table1", "%{data_key}": null, "%{data_updated_at_key}": "%{time_str}"}]',
          format_values
        ),
        expected_output: {'table1' => {'data_updated_at' => time_parsed}}
      },
      {
        input: format(
          '[{"%{sources_key}": "table1", "%{data_key}": {}, "%{data_updated_at_key}": "%{time_str}"}]',
          format_values
        ),
        expected_output: {'table1' => {'data_updated_at' => time_parsed}}
      },
      {
        input: format(
          '[{"%{sources_key}": "table1", "%{data_key}": {"opt_in": 1}, "%{data_updated_at_key}": "%{time_str}"}]',
          format_values
        ),
        expected_output: {'table1' => {'opt_in' => 1, 'data_updated_at' => time_parsed}}
      },
      {
        input: format('['\
          '{"%{sources_key}": "table1", "%{data_key}": {"opt_in": 1}, "%{data_updated_at_key}": "%{time_str}"},'\
          '{"%{sources_key}": "table2", "%{data_key}": {"state": "WA"}, "%{data_updated_at_key}": "%{time_str}"}]',
          format_values
        ),
        expected_output: {
          'table1' => {'opt_in' => 1, 'data_updated_at' => time_parsed},
          'table2' => {'state' => 'WA', 'data_updated_at' => time_parsed}
        }
      }
    ]

    tests.each_with_index do |test, index|
      output = ContactRollupsProcessed.parse_contact_data test[:input]
      assert_equal test[:expected_output], output, "Test index #{index} failed"
    end
  end

  test 'parse_contact_data throws exception for invalid input' do
    test_inputs = [
      nil,
      '',
      '[{}]',
      '[{"sources": "table"}]',
      '[{"data_updated_at" => null}]',
      '[{"data_updated_at" => "invalid date"}]'
    ]

    test_inputs.each do |input|
      assert_raises do
        ContactRollupsProcessed.parse_contact_data input
      end
    end
  end
end
