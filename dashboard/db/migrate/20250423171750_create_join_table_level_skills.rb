class CreateJoinTableLevelSkills < ActiveRecord::Migration[6.1]
  def change
    drop_table :levels_skills if ActiveRecord::Base.connection.table_exists?(:levels_skills)
    create_join_table :levels, :skills do |t|
      t.index [:level_id, :skill_id]
      t.index [:skill_id, :level_id]
    end
  end
end
