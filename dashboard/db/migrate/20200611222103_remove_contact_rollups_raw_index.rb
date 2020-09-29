class RemoveContactRollupsRawIndex < ActiveRecord::Migration[5.0]
  def change
    remove_index :contact_rollups_raw, column: [:email, :sources]
  end
end
