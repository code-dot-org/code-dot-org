class CreateContactRollupsComparison < ActiveRecord::Migration[5.0]
  def change
    create_table :contact_rollups_comparisons do |t|
      t.string :email, null: false, index: {unique: true}
      t.json :old_data
      t.datetime :old_data_updated_at
      t.json :new_data
      t.datetime :new_data_updated_at
      t.datetime :created_at
    end
  end
end
