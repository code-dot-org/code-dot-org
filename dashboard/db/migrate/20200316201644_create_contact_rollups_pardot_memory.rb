class CreateContactRollupsPardotMemory < ActiveRecord::Migration[5.0]
  def change
    create_table :contact_rollups_pardot_memory do |t|
      t.string :email, null: false
      t.integer :pardot_id
      t.datetime :pardot_id_updated_at
      t.json :data_synced
      t.datetime :data_synced_at
      t.datetime :data_rejected_at
      t.string :data_rejected_reason
      t.timestamps
    end

    add_index :contact_rollups_pardot_memory, :email, unique: true
    add_index :contact_rollups_pardot_memory, :pardot_id, unique: true
  end
end
