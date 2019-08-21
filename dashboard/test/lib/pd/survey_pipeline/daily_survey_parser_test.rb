require 'test_helper'
require 'pd/survey_pipeline/daily_survey_parser.rb'

module Pd::SurveyPipeline
  class DailySurveyParserTest < ActiveSupport::TestCase
    include Pd::WorkshopConstants
    include Pd::JotForm::Constants

    self.use_transactional_test_case = true

    setup_all do
      @ws_form_id = "11000000000000".to_i

      ws = create :csf_deep_dive_workshop
      teacher = create :teacher
      day = 0

      @ws_survey_questions = create :pd_survey_question, form_id: @ws_form_id,
        questions: '['\
          '{"id": 1, "type": "number", "name": "overallRating", "text": "Overall rating"},'\
          '{"id": 2, "type": "dropdown", "name": "selectOption", "text": "Select one of the options",'\
          '"options": ["Option 1", "Option 2", "Option 3"]},'\
          '{"id": 3, "type": "textarea", "name": "describe", "text": "Describe something"},'\
          '{"id": 4, "type": "matrix", "name": "multiQuestions", "text": "Answer all sub questions",'\
          '"options": ["Option 1", "Option 2", "Option 3"],'\
          '"sub_questions": ["Sub question 1", "Sub question 2", "Sub question 3"]}'\
        ']'

      @ws_submission = create :pd_workshop_daily_survey,
        form_id: @ws_form_id, pd_workshop: ws, user: teacher, day: day,
        answers: '{"1":"5.0", "2":"Option 2", "3":"Like it", "4": '\
          '{"Sub question 1": "Option 1", "Sub question 2": "Option 2", "Sub question 3": "Option 3"}}'
    end

    test 'produce output keys' do
      context = {
        survey_questions: [@ws_survey_questions],
        workshop_submissions: [@ws_submission],
        facilitator_submissions: []
      }

      DailySurveyParser.process_data context

      assert context[:parsed_questions].present?
      assert context[:parsed_submissions].present?
    end

    test 'can parse questions' do
      expected_result = {
        @ws_form_id => {
          '1' => {type: 'number', name: 'overallRating', text: 'Overall rating',
            answer_type: ANSWER_TEXT},
          '2' => {type: 'dropdown', name: 'selectOption', text: 'Select one of the options',
            options: ['Option 1', 'Option 2', 'Option 3'],
            option_map: {'Option 1' => 1, 'Option 2' => 2, 'Option 3' => 3},
            answer_type: ANSWER_SINGLE_SELECT},
          '3' => {type: 'textarea', name: 'describe', text: 'Describe something',
            answer_type: ANSWER_TEXT},
          '4' => {type: 'matrix', name: 'multiQuestions', text: 'Answer all sub questions',
            sub_questions: ['Sub question 1', 'Sub question 2', 'Sub question 3'],
            options: ['Option 1', 'Option 2', 'Option 3'],
            option_map: {'Option 1' => 1, 'Option 2' => 2, 'Option 3' => 3},
            answer_type: ANSWER_MULTI_SELECT}
        }
      }

      result = DailySurveyParser.parse_questions([@ws_survey_questions])

      assert_equal expected_result, result
    end

    test 'can parse submission' do
      expected_result = {
        @ws_form_id => {
          @ws_submission.submission_id => {
            workshop_id: @ws_submission.pd_workshop_id,
            user_id: @ws_submission.user_id,
            day: @ws_submission.day,
            session_id: nil,
            facilitator_id: nil,
            answers: {
              '1' => '5.0',
              '2' => 'Option 2',
              '3' => 'Like it',
              '4' => [
                {text: 'Sub question 1', answer: 'Option 1'},
                {text: 'Sub question 2', answer: 'Option 2'},
                {text: 'Sub question 3', answer: 'Option 3'}
              ]
            }
          }
        }
      }

      result = DailySurveyParser.parse_submissions([@ws_submission])

      assert_equal expected_result, result
    end
  end
end
