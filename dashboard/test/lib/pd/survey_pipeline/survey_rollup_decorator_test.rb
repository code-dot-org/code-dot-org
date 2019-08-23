require 'test_helper'
require 'pd/survey_pipeline/survey_rollup_decorator.rb'

module Pd::SurveyPipeline
  class SurveyRollupDecoratorTest < ActiveSupport::TestCase
    def get_dummy_q_categories
      %w(cat1 cat2)
    end

    def get_dummy_parsed_q
      {
        11111 => {
          '1' => {type: 'number', name: 'cat1_overallRating', text: 'Overall rating',
                  answer_type: 'text'},
          '2' => {type: 'dropdown', name: 'cat2_selectOption', text: 'Select one of the options',
                  options: ['Option 1', 'Option 2', 'Option 3'],
                  option_map: {'Option 1' => 1, 'Option 2' => 2, 'Option 3' => 3},
                  answer_type: 'singleSelect'}
        },
        22222 => {
          '3' => {type: 'textarea', name: 'cat2_describe', text: 'Describe something',
                  answer_type: 'text'},
          '4' => {type: 'matrix', name: 'cat1_multiQuestions', text: 'Answer all sub questions',
                  sub_questions: ['Sub question 1', 'Sub question 2', 'Sub question 3'],
                  options: ['Option 1', 'Option 2', 'Option 3'],
                  option_map: {'Option 1' => 1, 'Option 2' => 2, 'Option 3' => 3},
                  answer_type: 'multiSelect'}
        }
      }
    end
  end
end
