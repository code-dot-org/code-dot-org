class CreateRawContacts < ActiveRecord::Migration[5.0]
  def change
    create_table :raw_contacts do |t|
      t.string :email, null: false
      t.string :sources, null: false
      t.json :data
      t.datetime :data_updated_at, null: false
      t.timestamps
    end

    add_index :raw_contacts, [:email, :sources], unique: true
  end
end
