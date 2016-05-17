class AddWeightToPlcEvaluationAnswers < ActiveRecord::Migration
  def change
    add_column :plc_evaluation_answers, :weight, :integer, default: 1, null: false
  end
end
