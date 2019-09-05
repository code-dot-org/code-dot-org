require 'test_helper'

module Pd::SurveyPipeline
  class DailySurveyModifierTest < ActiveSupport::TestCase
    test 'augmenting multiple questions for display' do
      # Question collection format: {form_id => {question_id => question_content}}
      parsed_questions = {
        111222 => {
          '1' => {type: 'scale', options: %w(Lowest highest), values: [1, 2]},
          '2' => {type: 'scale', options: %w(From To), values: [1, 2, 3, 4]}
        }
      }

      DailySurveyModifier.expects(:augment_scale_question_for_display).twice

      DailySurveyModifier.augment_questions_for_display parsed_questions
    end

    test 'augmenting scale question for display' do
      test_cases = [
        {
          input: {
            options: %w(Lowest Highest),
            values: [1, 2]
          },
          output: {
            options: ['1 - Lowest', '2 - Highest'],
            values: [1, 2],
            min_value: 1,
            max_value: 2
          }
        },
        {
          input: {
            options: %w(Disagree Agree),
            values: [1, 2, 3, 4]
          },
          output: {
            options: ['1 - Disagree', '2', '3', '4 - Agree'],
            values: [1, 2, 3, 4],
            min_value: 1,
            max_value: 4
          }
        }
      ]

      test_cases.each do |test_case|
        output = DailySurveyModifier.augment_scale_question_for_display test_case[:input]
        assert_equal test_case[:output], output
      end
    end
  end
end
