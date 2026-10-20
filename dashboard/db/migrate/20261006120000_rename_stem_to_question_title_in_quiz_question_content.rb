class RenameStemToQuestionTitleInQuizQuestionContent < ActiveRecord::Migration[7.0]
  # Saved through the model so that on levelbuilder after_commit also
  # rewrites config/quiz_questions/*.json.
  def up
    rename_content_key('stem', 'question_title')
  end

  def down
    rename_content_key('question_title', 'stem')
  end

  private def rename_content_key(from, to)
    QuizQuestion.find_each do |question|
      next unless question.content.is_a?(Hash) && question.content.key?(from)
      question.content = question.content.except(from).merge(to => question.content[from])
      question.save!(validate: false)
    end
  end
end
