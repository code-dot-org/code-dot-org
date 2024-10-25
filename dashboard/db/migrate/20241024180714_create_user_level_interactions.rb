class CreateUserLevelInteractions < ActiveRecord::Migration[6.1]
  def change
    create_table :user_level_interactions do |t|
      t.integer :user_id, null: false
      t.integer :level_id, null: false
      t.integer :script_id, null: false
      t.string :school_year, null: false
      t.string :interaction, null: false
      t.string :code_version
      t.json :metadata

      t.timestamps

      t.index :user_id
      t.index :level_id
    end
  end
end
