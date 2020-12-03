class DropPlcTasks < ActiveRecord::Migration[5.0]
  def change
    drop_table :plc_learning_modules_tasks
    drop_table :plc_tasks
  end
end
