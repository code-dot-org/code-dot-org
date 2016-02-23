class CreatePlcTasks < ActiveRecord::Migration
  def change
    create_table :plc_tasks do |t|
      t.string :name
      t.references :plc_learning_module, index: true

      t.timestamps null: false
    end
  end
end
