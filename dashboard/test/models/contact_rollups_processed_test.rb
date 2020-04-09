require 'test_helper'

class ContactRollupsProcessedTest < ActiveSupport::TestCase
  test 'import_from_raw_table creates one row per email' do
    clean_tables

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
    clean_tables

    email = 'email@example.domain'
    create :contact_rollups_raw, email: email, data: nil
    create :contact_rollups_raw, email: email, data: {opt_in: 0}
    create :contact_rollups_raw, email: email, sources: 'dashboard.email_preferences', data: {opt_in: 1}
    expected_output_data = {'opt_in' => 1}

    ContactRollupsProcessed.import_from_raw_table

    assert_equal 1, ContactRollupsProcessed.count
    assert_equal expected_output_data, ContactRollupsProcessed.first.data
  end

  test 'import_from_raw_table calls all extraction functions' do
    clean_tables
    create :contact_rollups_raw

    # Each extraction function will be called once per unique email address
    ContactRollupsProcessed.expects(:extract_opt_in).once

    ContactRollupsProcessed.import_from_raw_table
  end

  test 'extract_opt_in' do
    test_cases = [
      {input: {}, expected_output: nil},
      {input: {'dashboard.email_preferences' => {}}, expected_output: nil},
      {input: {'dashboard.another_table' => {opt_in: 1}}, expected_output: nil},
      {input: {'dashboard.email_preferences' => {'opt_in' => 0}}, expected_output: {opt_in: 0}},
      {input: {'dashboard.email_preferences' => {'opt_in' => 1}}, expected_output: {opt_in: 1}},
      {input: {'dashboard.email_preferences' => {'opt_in' => nil}}, expected_output: {opt_in: nil}}
    ]

    test_cases.each_with_index do |test, index|
      output = ContactRollupsProcessed.extract_opt_in test[:input]
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

    tests = [
      {
        input: format('[{"sources": "table1", "data": null, "data_updated_at": "%s"}]', time_str),
        expected_output: {'table1' => {'data_updated_at' => time_parsed}}
      },
      {
        input: format('[{"sources": "table1", "data": {}, "data_updated_at": "%s"}]', time_str),
        expected_output: {'table1' => {'data_updated_at' => time_parsed}}
      },
      {
        input: format('[{"sources": "table1", "data": {"opt_in": 1}, "data_updated_at": "%s"}]', time_str),
        expected_output: {'table1' => {'opt_in' => 1, 'data_updated_at' => time_parsed}}
      },
      {
        input: format('['\
          '{"sources": "table1", "data": {"opt_in": 1}, "data_updated_at": "%s"},'\
          '{"sources": "table2", "data": {"state": "WA"}, "data_updated_at": "%s"}]',
          time_str, time_str
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

  def clean_tables
    ContactRollupsRaw.delete_all
    ContactRollupsProcessed.delete_all
  end
end
