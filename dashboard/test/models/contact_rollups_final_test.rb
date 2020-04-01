require 'test_helper'

class ContactRollupsFinalTest < ActiveSupport::TestCase
  test 'overwrite_from_processed_table! overwrites contact_rollups_final' do
    clean_tables

    processed = create_list :contact_rollups_processed, 5
    create_list :contact_rollups_final, 3

    ContactRollupsFinal.delete_all # Stand in for ContactRollupsFinal.truncate, which tests don't allow b/c modifies DDL
    ContactRollupsFinal.insert_from_processed_table

    assert_equal 5, ContactRollupsFinal.count
    processed.each do |contact|
      assert_equal contact.data, ContactRollupsFinal.find_by(email: contact.email).data
    end
  end

  def clean_tables
    ContactRollupsProcessed.delete_all
    ContactRollupsFinal.delete_all
  end
end
