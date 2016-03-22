class AddIconToPlcTasks < ActiveRecord::Migration
  def change
    add_column :plc_tasks, :icon, :string
  end
end
