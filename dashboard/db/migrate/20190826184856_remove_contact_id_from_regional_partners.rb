class RemoveContactIdFromRegionalPartners < ActiveRecord::Migration[5.0]
  def change
    # This migration was retroactively changed on August 28th.
    # The original form had the statements in reverse order, and looked like this:
    #
    # remove_column :regional_partners, :contact_id, :integer
    # remove_index :regional_partners, name: "index_regional_partners_on_name_and_contact_id"
    #
    # However if a duplicate name existed in regional_partners, removing the contact_id column
    # would cause a violation of the unique index and prevent the migration from running.
    # In its current form this should not be an issue, and the end result of running the
    # migration should be identical.

    remove_index :regional_partners, name: "index_regional_partners_on_name_and_contact_id"
    remove_column :regional_partners, :contact_id, :integer
  end
end
