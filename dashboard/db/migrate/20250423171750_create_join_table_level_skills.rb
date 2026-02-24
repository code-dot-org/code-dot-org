class CreateJoinTableLevelSkills < ActiveRecord::Migration[6.1]
  def change
    create_join_table :levels, :skills do |t|
      t.index [:level_id, :skill_id]
      t.index [:skill_id, :level_id]
    end
  end
end
