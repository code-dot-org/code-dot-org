class AddKeysToLevelsSkills < ActiveRecord::Migration[6.1]
  def change
    drop_table :levels_skills, if_exists: true

    create_table :levels_skills do |t|
      t.string :skill_key, null: false
      t.string :level_key, null: false

      t.timestamps
    end

    add_index :levels_skills, :skill_key
    add_index :levels_skills, :level_key
    add_index :levels_skills, [:skill_key, :level_key], unique: true
  end
end
