class AddRequiredColumnToPlcLearningModules < ActiveRecord::Migration
  def change
    add_column :plc_learning_modules, :required, :boolean
  end
end
