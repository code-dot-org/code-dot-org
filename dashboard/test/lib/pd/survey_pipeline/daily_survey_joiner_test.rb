require 'test_helper'
require 'pd/survey_pipeline/daily_survey_joiner.rb'

module Pd::SurveyPipeline
  class DailySurveyJoinerTest < ActiveSupport::TestCase
    include Pd::JotForm::Constants

    self.use_transactional_test_case = true

    setup_all do
      form_id = 11_000_000_000_000
      submission_id = 1

      @question_content = {
        'Q1' => {type: 'number', name: 'overallRating', text: 'Overall rating',
          answer_type: ANSWER_TEXT},
        'Q2' => {type: 'dropdown', name: 'selectOption', text: 'Select one of the options',
          options: ['Option 1', 'Option 2', 'Option 3'],
          option_map: {'Option 1' => 1, 'Option 2' => 2, 'Option 3' => 3},
          answer_type: ANSWER_SINGLE_SELECT},
        'Q3' => {type: 'textarea', name: 'describe', text: 'Describe something',
          answer_type: ANSWER_TEXT},
        'Q4' => {type: 'matrix', name: 'multiQuestions', text: 'Answer all sub questions',
          sub_questions: ['Sub question 1', 'Sub question 2', 'Sub question 3'],
          options: ['Option 1', 'Option 2', 'Option 3'],
          option_map: {'Option 1' => 1, 'Option 2' => 2, 'Option 3' => 3},
          answer_type: ANSWER_MULTI_SELECT}
      }

      @questions = {
        form_id => @question_content
      }

      @submissions_context = {
        workshop_id: nil,
        user_id: nil,
        day: nil,
        session_id: nil,
        facilitator_id: nil
      }

      @submissions = {
        form_id => {
          submission_id => @submissions_context.merge(
            answers: {
              'Q1' => '5.0',
              'Q2' => 'Option 2',
              'Q3' => 'Like it',
              'Q4' => [
                {text: 'Sub question 1', answer: 'Option 1'},
                {text: 'Sub question 2', answer: 'Option 2'},
                {text: 'Sub question 3', answer: 'Option 3'}
              ]
            }
          )
        }
      }

      @submissions_context.merge!(form_id: form_id, submission_id: submission_id)
    end

    test 'can join submission and question' do
      # Expected flatten results for non-matrix questions
      expected_result = [
        @submissions_context.merge(@question_content['Q1']).merge(qid: 'Q1', answer: '5.0'),
        @submissions_context.merge(@question_content['Q2']).merge(qid: 'Q2', answer: 'Option 2'),
        @submissions_context.merge(@question_content['Q3']).merge(qid: 'Q3', answer: 'Like it')
      ]

      # Expected flatten results for matrix question
      3.times do |i|
        qid = 'Q4'
        qname = @question_content[qid][:name]
        qtext = @question_content[qid][:text]

        expected_result << @submissions_context.
          merge(@question_content[qid].except(:sub_questions)).
          merge(
            qid: DailySurveyJoiner.compute_descendant_key(qid, "Sub question #{i + 1}"),
            name: DailySurveyJoiner.compute_descendant_key(qname, "Sub question #{i + 1}"),
            text: "#{qtext}->Sub question #{i + 1}",
            type: TYPE_RADIO,
            answer: "Option #{i + 1}",
            answer_type: ANSWER_SINGLE_SELECT,
            max_value: @question_content[qid][:options].length,
            parent: qname
          )
      end

      result = DailySurveyJoiner.transform_data questions: @questions, submissions: @submissions

      assert_equal expected_result, result
    end
  end
end
