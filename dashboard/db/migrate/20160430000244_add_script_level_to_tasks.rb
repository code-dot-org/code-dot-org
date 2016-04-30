class AddScriptLevelToTasks < ActiveRecord::Migration
  def change
    Plc::Task.destroy_all
    add_reference :plc_tasks, :script_level, index: true, foreign_key: true, required: true
  end
end
