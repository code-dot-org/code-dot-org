class AddRequiredColumnToPlcLearningModules < ActiveRecord::Migration[4.2]
  def change
    add_column :plc_learning_modules, :required, :boolean, null: false, default: false
  end
end
