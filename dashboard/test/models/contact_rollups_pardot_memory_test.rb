require 'test_helper'
require 'cdo/contact_rollups/v2/pardot'

class ContactRollupsPardotMemoryTest < ActiveSupport::TestCase
  test 'add_and_update_pardot_ids inserts new mappings' do
    ContactRollupsPardotMemory.delete_all

    new_mappings = [
      {email: "alex@rollups.com", pardot_id: 1},
      {email: "becky@rollups.com", pardot_id: 2}
    ]
    PardotV2.stubs(:retrieve_new_ids).returns(new_mappings)

    ContactRollupsPardotMemory.add_and_update_pardot_ids

    new_mappings.each do |mapping|
      refute_nil ContactRollupsPardotMemory.find_by(email: mapping[:email], pardot_id: mapping[:pardot_id])
    end
  end

  test 'add_and_update_pardot_ids updates existing mapping' do
    ContactRollupsPardotMemory.delete_all
    existing_record = create :contact_rollups_pardot_memory

    new_pardot_id = existing_record.pardot_id + 1
    PardotV2.stubs(:retrieve_new_ids).returns(
      [{email: existing_record.email, pardot_id: new_pardot_id}]
    )

    ContactRollupsPardotMemory.add_and_update_pardot_ids

    assert_equal new_pardot_id, ContactRollupsPardotMemory.find_by(email: existing_record.email)&.pardot_id
  end
end
