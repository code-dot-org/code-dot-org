class AddLevelsToScriptLevel < ActiveRecord::Migration
  def up
    create_join_table :levels, :script_levels do |t|
      t.index :level_id
      t.index :script_level_id
    end

    ScriptLevel.class_eval do
      belongs_to :old_level, class_name: "Level", foreign_key: "level_id"
    end

    ScriptLevel.all.each do |script_level|
      if script_level.old_level
        script_level.levels << script_level.old_level
        script_level.save!
      end
    end

    change_column_null :script_levels, :level_id, true
  end

  def down
    ScriptLevel.class_eval do
      belongs_to :new_level, class_name: "Level", foreign_key: "level_id"
    end

    ScriptLevel.all.each do |script_level|
      unless script_level.levels.empty?
        script_level.new_level = script_level.levels.first
        script_level.save!
      end
    end

    change_column_null :script_levels, :level_id, false

    drop_table :levels_script_levels
  end
end
