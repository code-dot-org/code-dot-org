require 'test_helper'

class ContactRollupsProcessedTest < ActiveSupport::TestCase
  include Pd::WorkshopConstants

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
    base_time = Time.now.utc
    email = 'email@example.domain'
    create :contact_rollups_raw, email: email,
      sources: 'dashboard.users', data: nil, data_updated_at: base_time - 2.days
    create :contact_rollups_raw, email: email,
      sources: 'dashboard.email_preferences', data: {opt_in: 1}, data_updated_at: base_time - 1.day
    create :contact_rollups_raw, email: email,
      sources: 'dashboard.pd_enrollments', data: {course: COURSE_CSF}, data_updated_at: base_time

    refute ContactRollupsProcessed.find_by_email(email)
    ContactRollupsProcessed.import_from_raw_table

    record = ContactRollupsProcessed.find_by_email!(email)
    assert_equal 1, record.data['opt_in']
    assert_equal COURSE_CSF, record.data['professional_learning_enrolled']
    assert_equal base_time.to_i, Time.parse(record.data['updated_at']).to_i
  end

  test 'import_from_raw_table calls all extraction functions' do
    assert 0, ContactRollupsRaw.count
    create :contact_rollups_raw

    # Each extraction function will be called once per unique email address
    ContactRollupsProcessed.expects(:extract_opt_in).
      once.
      returns({opt_in: 1})
    ContactRollupsProcessed.expects(:extract_updated_at).
      once.
      returns({updated_at: Time.now.utc})

    ContactRollupsProcessed.import_from_raw_table
  end

  test 'extract_field' do
    table = 'pegasus.form_geos'
    field = 'state'

    test_cases = [
      # 3 input params are: contact_data, table, field
      {
        # all empty
        input: [{}, nil, nil],
        expected_output: nil
      },
      {
        # table exists in contact data but field doesn't
        input: [{table => {}}, table, field],
        expected_output: nil
      },
      {
        # field exists in contact data but table doesn't
        input: [{'pegasus.another_table' => {field => [{'value' => 'WA'}]}}, table, field],
        expected_output: nil
      },
      {
        # table and field exists in contact data, field value is nil
        input: [{table => {field => [{'value' => nil}]}}, table, field],
        expected_output: [nil]
      },
      {
        # table and field exists in contact data with non-nil value
        input: [{table => {field => [{'value' => 'WA'}]}}, table, field],
        expected_output: ['WA']
      },
      {
        # table and field exist in contact data with multiple non-nil values
        input: [{table => {field => [{'value' => 'WA'}, {'value' => 'OR'}]}}, table, field],
        expected_output: %w[WA OR]
      },
    ]

    test_cases.each_with_index do |test, index|
      output = ContactRollupsProcessed.extract_field(*test[:input])
      assert_equal test[:expected_output], output, "Test index #{index} failed"
    end
  end

  test 'extract_professional_learning_enrolled' do
    contact_data = {
      'dashboard.pd_enrollments' => {
        'course' => [
          {'value' => COURSE_CSF},
          {'value' => COURSE_CSF},
          {'value' => COURSE_CSD},
          {'value' => nil}
        ]
      }
    }
    # output should not contains nil or duplicate values, and should be sorted
    expected_output = {
      professional_learning_enrolled: "#{COURSE_CSD},#{COURSE_CSF}"
    }

    output = ContactRollupsProcessed.extract_professional_learning_enrolled(contact_data)
    assert_equal expected_output, output
  end

  test 'extract_updated_at with valid input' do
    base_time = Time.now.utc - 7.days
    tests = [
      {
        input: {'table1' => {'last_data_updated_at' => base_time}},
        expected_output: {updated_at: base_time}
      },
      {
        input: {
          'table1' => {'last_data_updated_at' => base_time - 1.day},
          'table2' => {'last_data_updated_at' => base_time + 1.day},
          'table3' => {'last_data_updated_at' => base_time},
        },
        expected_output: {updated_at: base_time + 1.day}
      }
    ]

    tests.each_with_index do |test, index|
      output = ContactRollupsProcessed.extract_updated_at(test[:input])
      assert_equal test[:expected_output], output, "Test index #{index} failed"
    end
  end

  test 'extract_updated_at with invalid input' do
    assert_raise StandardError do
      ContactRollupsProcessed.extract_updated_at({'table' => {}})
    end
  end

  test 'parse_contact_data parses valid input' do
    # TODO: (ha) break this long test into smaller ones
    time_str = '2020-03-11 15:01:26'
    time_parsed = Time.find_zone('UTC').parse(time_str)
    time_str_2 = '2020-06-22 16:26:00'
    time_parsed_2 = Time.find_zone('UTC').parse(time_str_2)
    format_values = {
      sources_key: ContactRollupsProcessed::SOURCES_KEY,
      data_key: ContactRollupsProcessed::DATA_KEY,
      data_updated_at_key: ContactRollupsProcessed::DATA_UPDATED_AT_KEY,
      time_str: time_str,
      time_str_2: time_str_2
    }

    # Test inputs are JSON strings.
    # Use string +format+ method so we don't have to escape every double quotes.
    # Example of a JSON string test: "[{\"s\": \"table1\", \"d\": null, \"u\": \"2020-03-11 15:01:26\"}]"
    tests = [
      {
        # input data is null
        input: format(
          '[{"%{sources_key}": "table1", "%{data_key}": null, "%{data_updated_at_key}": "%{time_str}"}]',
          format_values
        ),
        expected_output: {'table1' => {'last_data_updated_at' => time_parsed}}
      },
      # input data is an empty hash
      {
        input: format(
          '[{"%{sources_key}": "table1", "%{data_key}": {}, "%{data_updated_at_key}": "%{time_str}"}]',
          format_values
        ),
        expected_output: {'table1' => {'last_data_updated_at' => time_parsed}}
      },
      # input data has a valid key but its value is null
      {
        input: format(
          '[{"%{sources_key}": "table2", "%{data_key}": {"state": null}, "%{data_updated_at_key}": "%{time_str}"}]',
          format_values
        ),
        expected_output: {
          'table2' => {
            'state' => ['value' => nil, 'data_updated_at' => time_parsed],
            'last_data_updated_at' => time_parsed
          }
        }
      },
      # input data has valid key and value
      {
        input: format(
          '[{"%{sources_key}": "table1", "%{data_key}": {"opt_in": 1}, "%{data_updated_at_key}": "%{time_str}"}]',
          format_values
        ),
        expected_output: {
          'table1' => {
            'opt_in' => [{'value' => 1, 'data_updated_at' => time_parsed}],
            'last_data_updated_at' => time_parsed
          }
        }
      },
      # input data has more than one value for a key and each value came in a different date
      {
        input: format(
          '['\
          '{"%{sources_key}": "table2", "%{data_key}": {"state": "WA"}, "%{data_updated_at_key}": "%{time_str}"},'\
          '{"%{sources_key}": "table2", "%{data_key}": {"state": "OR"}, "%{data_updated_at_key}": "%{time_str_2}"}'\
          ']',
          format_values
        ),
        expected_output: {
          'table2' => {
            'state' => [
              {'value' => 'WA', 'data_updated_at' => time_parsed},
              {'value' => 'OR', 'data_updated_at' => time_parsed_2}
            ],
            'last_data_updated_at' => time_parsed_2
          }
        }
      },
      # input data comes from 2 tables with different valid keys
      {
        input: format('['\
          '{"%{sources_key}": "table1", "%{data_key}": {"opt_in": 1}, "%{data_updated_at_key}": "%{time_str}"},'\
          '{"%{sources_key}": "table2", "%{data_key}": {"state": "WA"}, "%{data_updated_at_key}": "%{time_str}"}]',
          format_values
        ),
        expected_output: {
          'table1' => {
            'opt_in' => [{'value' => 1, 'data_updated_at' => time_parsed}],
            'last_data_updated_at' => time_parsed
          },
          'table2' => {
            'state' => [{'value' => 'WA', 'data_updated_at' => time_parsed}],
            'last_data_updated_at' => time_parsed
          }
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
