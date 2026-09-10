class AddIndexOnCreatedAtToQuizQuestions < ActiveRecord::Migration[7.0]
  def change
    add_index :quiz_questions, :created_at
  end
end
