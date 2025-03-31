class CreateUserPreferenceTable < ActiveRecord::Migration[6.1]
  def change
    create_table :user_preference do |t|
      t.integer :user_id, null: false
      t.integer :section_order, array: true
      t.timestamps
      t.index :user_id
    end
  end
end
