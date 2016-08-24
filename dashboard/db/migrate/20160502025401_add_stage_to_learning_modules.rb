class AddStageToLearningModules < ActiveRecord::Migration[4.2]
  def change
    add_reference :plc_learning_modules, :stage, index: true, foreign_key: true
  end
end
