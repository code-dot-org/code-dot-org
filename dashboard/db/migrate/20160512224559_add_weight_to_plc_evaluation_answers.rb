class AddWeightToPlcEvaluationAnswers < ActiveRecord::Migration[4.2]
  def change
    add_column :plc_evaluation_answers, :weight, :integer, default: 1, null: false
  end
end
