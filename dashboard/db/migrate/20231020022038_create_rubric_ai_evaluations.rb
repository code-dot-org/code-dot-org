class CreateRubricAiEvaluations < ActiveRecord::Migration[6.1]
  def change
    create_table :rubric_ai_evaluations do |t|
      t.references :user, index: true, foreign_key: true, null: false, type: :integer
      t.references :requester, index: {name: 'rubric_ai_evaluation_requester_index'}, foreign_key: {to_table: :users}, null: false, type: :integer
      t.integer :project_id, null: false
      t.string :project_version, limit: 255
      t.integer :status

      t.timestamps
    end
  end
end
