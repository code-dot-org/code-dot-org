class AssociateAnswersWithModulesNotTasks < ActiveRecord::Migration
  def change
    #At the time this migration was written there were no Evaluation Answers in production, so it's safe to blow
    #everything up
    Plc::EvaluationAnswer.destroy_all
    remove_column :plc_evaluation_answers, :plc_task_id, :integer
    add_reference :plc_evaluation_answers, :plc_learning_module, index: true
  end
end
