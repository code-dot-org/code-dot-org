class AddStageToLearningModules < ActiveRecord::Migration
  def change
    Plc::LearningModule.destroy_all
    add_reference :plc_learning_modules, :stage, index: true, foreign_key: true, required: true
  end
end
