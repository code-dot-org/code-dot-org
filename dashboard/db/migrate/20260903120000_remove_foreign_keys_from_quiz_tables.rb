class RemoveForeignKeysFromQuizTables < ActiveRecord::Migration[7.0]
  def change
    remove_foreign_key :quiz_attempts, :levels
    remove_foreign_key :quiz_attempts, :scripts, column: :unit_id
    remove_foreign_key :quiz_attempts, :users
    remove_foreign_key :quiz_question_placements, :levels
    remove_foreign_key :quiz_question_placements, :quiz_questions
    remove_foreign_key :quiz_question_responses, :quiz_attempts
    remove_foreign_key :quiz_question_responses, :quiz_questions
    remove_foreign_key :quiz_question_standards, :quiz_questions
    remove_foreign_key :quiz_question_standards, :standards
  end
end
