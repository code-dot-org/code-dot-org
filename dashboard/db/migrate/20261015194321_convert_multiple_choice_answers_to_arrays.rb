class ConvertMultipleChoiceAnswersToArrays < ActiveRecord::Migration[7.0]
  # Questions are saved through the model so that on levelbuilder
  # after_commit also rewrites config/quiz_questions/*.json.
  def up
    MultipleChoiceQuestion.find_each do |question|
      next unless question.content.is_a?(Hash) && question.content.key?('correct_choice_id')
      id = question.content['correct_choice_id']
      question.content = question.content.except('correct_choice_id').merge('correct_choice_ids' => [id])
      question.save!(validate: false)
    end

    QuizQuestionResponse.find_each do |response|
      data = response.response_data
      next unless data.is_a?(Hash) && data.key?('selectedChoiceId')
      ids = data['selectedChoiceId'].present? ? [data['selectedChoiceId']] : []
      response.update_column(:response_data, data.except('selectedChoiceId').merge('selectedChoiceIds' => ids))
    end
  end

  # Fails on a question or response with more than one choice.
  def down
    MultipleChoiceQuestion.find_each do |question|
      next unless question.content.is_a?(Hash) && question.content.key?('correct_choice_ids')
      ids = question.content['correct_choice_ids']
      raise ActiveRecord::IrreversibleMigration, "question #{question.id} has #{ids.length} correct choices" if ids.length > 1
      question.content = question.content.except('correct_choice_ids', 'select_multiple').merge('correct_choice_id' => ids.first)
      question.save!(validate: false)
    end

    QuizQuestionResponse.find_each do |response|
      data = response.response_data
      next unless data.is_a?(Hash) && data.key?('selectedChoiceIds')
      ids = data['selectedChoiceIds']
      raise ActiveRecord::IrreversibleMigration, "response #{response.id} has #{ids.length} selected choices" if ids.length > 1
      new_data = data.except('selectedChoiceIds')
      new_data['selectedChoiceId'] = ids.first if ids.any?
      response.update_column(:response_data, new_data)
    end
  end
end
