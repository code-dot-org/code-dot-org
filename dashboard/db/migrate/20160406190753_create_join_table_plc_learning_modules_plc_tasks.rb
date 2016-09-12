class CreateJoinTablePlcLearningModulesPlcTasks < ActiveRecord::Migration[4.2]
  def up
    create_join_table :plc_learning_modules, :plc_tasks do |t|
      t.index :plc_learning_module_id
      t.index :plc_task_id
    end
    execute 'insert into plc_learning_modules_tasks (plc_learning_module_id, plc_task_id) select plc_learning_module_id, id from plc_tasks;'
    remove_column :plc_tasks, :plc_learning_module_id
  end

  def down
    add_column :plc_tasks, :plc_learning_module_id, :integer
    execute 'update plc_tasks t inner join plc_learning_modules_tasks j on t.id = j.plc_task_id set t.plc_learning_module_id = j.plc_learning_module_id;'
    drop_table :plc_learning_modules_tasks
  end
end
