class DropContactRollupsFinal < ActiveRecord::Migration[6.1]
  def change
    drop_table :contact_rollups_final, if_exists: true
  end
end
