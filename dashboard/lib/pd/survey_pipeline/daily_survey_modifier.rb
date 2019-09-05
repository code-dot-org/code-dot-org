module Pd::SurveyPipeline
  class DailySurveyModifier
    include Pd::JotForm::Constants

    # Augment a collection of questions for the purpose of displaying in UI.
    #
    # @param [Hash] parsed_questions {form_id => {question_id => question_content}}
    # @return [Hash] The same input with modified question content
    #
    def self.augment_questions_for_display(parsed_questions = {})
      parsed_questions.each do |_, form_questions|
        form_questions.each do |q_id, q_content|
          form_questions[q_id] = augment_scale_question_for_display(q_content) if
            q_content[:type] == TYPE_SCALE
        end
      end
    end

    # Augment a scale question for the purpose of displaying in UI.
    #
    # @param [Hash] question Contains all question attributes. Must have values and options keys
    # @return [Hash] A copy of input question with augmented attributes
    #
    def self.augment_scale_question_for_display(question)
      # JotForm format: values.first and values.last are the the lowest and highest rating points.
      # E.g. values = [1, 2, 3]
      min_value = question[:values].first
      max_value = question[:values].last

      # JotForm format: options.first and options.last are the lowest and highest rating texts.
      # E.g. options = ['Lowest', 'Highest']
      augmented_options = question[:values].map(&:to_s)
      augmented_options[0] = "#{augmented_options[0]} - #{question[:options].first}"
      augmented_options[-1] = "#{augmented_options[-1]} - #{question[:options].last}"

      question.merge(
        min_value: min_value,
        max_value: max_value,
        options: augmented_options
      )
    end
  end
end
