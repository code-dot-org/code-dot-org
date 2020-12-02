class CreateContactRollupsFinal < ActiveRecord::Migration[5.0]
  def change
    create_table :contact_rollups_final do |t|
      t.string :email, null: false, index: {unique: true}
      t.json :data, null: false
      t.timestamps
    end
  end
end
