require 'test_helper'

class ContactRollupsComparisonTest < ActiveSupport::TestCase
  test 'compile_processed_data when old data is empty' do
    clean_tables
    new_contact_count = 5
    create_list :contact_rollups_processed, new_contact_count

    ContactRollupsComparison.compile_processed_data

    assert_equal new_contact_count, ContactRollupsComparison.count
  end

  test 'compile_processed_data when new data is empty' do
    clean_tables
    old_contact_count = 3
    create_list :contact_rollups_final, old_contact_count

    ContactRollupsComparison.compile_processed_data

    assert_equal old_contact_count, ContactRollupsComparison.count
  end

  test 'compile_processed_data when new and old data overlap' do
    clean_tables
    total_contact_count = 9
    (1..5).each {|index| create :contact_rollups_processed, email: "email#{index}@example.domain"}
    (3..total_contact_count).each {|index| create :contact_rollups_final, email: "email#{index}@example.domain"}

    ContactRollupsComparison.compile_processed_data

    assert_equal total_contact_count, ContactRollupsComparison.count
  end

  def clean_tables
    ContactRollupsFinal.delete_all
    ContactRollupsProcessed.delete_all
    ContactRollupsComparison.delete_all
  end
end
