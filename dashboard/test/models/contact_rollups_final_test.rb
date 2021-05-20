require 'test_helper'

class ContactRollupsFinalTest < ActiveSupport::TestCase
  test 'insert_from_processed_table properly inserts into contact_rollups_final' do
    assert 0, ContactRollupsProcessed.count
    assert 0, ContactRollupsFinal.count

    processed = create_list :contact_rollups_processed, 5

    ContactRollupsFinal.insert_from_processed_table

    assert_equal 5, ContactRollupsFinal.count
    processed.each do |contact|
      assert_equal contact.data, ContactRollupsFinal.find_by(email: contact.email).data
    end
  end
end
