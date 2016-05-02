class AddScriptLevelToTasks < ActiveRecord::Migration
  def change
    add_reference :plc_tasks, :script_level, index: true, foreign_key: true
  end
end
