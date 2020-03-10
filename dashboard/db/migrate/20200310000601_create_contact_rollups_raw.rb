class CreateContactRollupsRaw < ActiveRecord::Migration[5.0]
  def change
    create_table :contact_rollups_raw do |t|
      t.string :email, null: false
      t.string :sources, null: false
      t.json :data
      t.datetime :data_updated_at, null: false
      t.timestamps
    end

    add_index :contact_rollups_raw, [:email, :sources], unique: true
  end
end
