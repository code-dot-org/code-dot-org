class CreateUserPracticeProblemAttempt < ActiveRecord::Migration[7.0]
  def change
    create_table :user_practice_problem_attempts do |t|
      t.belongs_to :user, null: false
      t.belongs_to :practice_problem, null: false
      t.json :attempt, null: false
      t.boolean :correct, null: false
      t.text :ai_feedback
      t.string :delivery_context_type, null: false
      t.json :delivery_context_metadata
      t.timestamps
    end
  end
end
