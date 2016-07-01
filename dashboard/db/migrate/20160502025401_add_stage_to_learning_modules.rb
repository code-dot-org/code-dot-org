class AddStageToLearningModules < ActiveRecord::Migration
  def change
    add_reference :plc_learning_modules, :stage, index: true, foreign_key: true
  end
end
