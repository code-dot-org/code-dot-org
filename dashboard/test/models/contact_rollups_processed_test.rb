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
      output = ContactRollupsProcessed.extract_opt_in(test[:input])
      assert_equal test[:expected_output], output, "Test index #{index} failed"
    end
  end

  def clean_tables
    ContactRollupsRaw.delete_all
    ContactRollupsProcessed.delete_all
  end
end
