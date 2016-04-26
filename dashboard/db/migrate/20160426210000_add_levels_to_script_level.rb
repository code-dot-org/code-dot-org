class AddLevelsToScriptLevel < ActiveRecord::Migration
  def up
    create_join_table :levels, :script_levels do |t|
      t.index :level_id
      t.index :script_level_id
    end

    ScriptLevel.class_eval do
      belongs_to :old_level, class_name: "Level", foreign_key: "level_id"
    end

    ScriptLevel.all.each do |scriptlevel|
      unless scriptlevel.old_level.nil?
        scriptlevel.levels << scriptlevel.old_level
        scriptlevel.save
      end
    end
  end

  def down
    ScriptLevel.class_eval do
      belongs_to :new_level, class_name: "Level", foreign_key: "level_id"
    end

    ScriptLevel.all.each do |scriptlevel|
      unless scriptlevel.levels.empty?
        scriptlevel.new_level = scriptlevel.levels.first
        scriptlevel.save
      end
    end
    drop_table :levels_script_levels
  end
end
