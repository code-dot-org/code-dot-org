class DropSkillsTables < ActiveRecord::Migration[6.1]
  def change
    drop_table :levels_skills, id: false, if_exists: true do |t|
      t.bigint :level_id, null: false
      t.bigint :skill_id, null: false
      t.index [:level_id, :skill_id]
      t.index [:skill_id, :level_id]
    end

    drop_table :skills, if_exists: true do |t|
      t.string :description, null: false
      t.text :evaluation_criteria
      t.string :concept
      t.timestamps
      t.string :key, null: false
      t.index :key, unique: true
    end

    remove_column :student_work_evaluations, :skill_id, :integer
  end
end
