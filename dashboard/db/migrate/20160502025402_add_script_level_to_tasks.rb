class AddScriptLevelToTasks < ActiveRecord::Migration[4.2]
  def change
    add_reference :plc_tasks, :script_level, index: true, foreign_key: true
  end
end
