class AddFulltextIndexToQuizQuestionsQuestionName < ActiveRecord::Migration[7.0]
  def change
    # Backs QuizQuestionAutocomplete's MATCH(question_name) AGAINST(...)
    # query for the question bank search box - see
    # dashboard/lib/autocomplete_helper.rb for the shared pattern this
    # follows (also used by Vocabulary/Resources/Standards search).
    add_index :quiz_questions, :question_name, type: :fulltext
  end
end
