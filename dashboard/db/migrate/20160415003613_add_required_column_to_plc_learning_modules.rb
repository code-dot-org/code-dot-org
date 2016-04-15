class AddRequiredColumnToPlcLearningModules < ActiveRecord::Migration
  def change
    add_column :plc_learning_modules, :required, :boolean, null: false, default: false
  end
end
