require 'test_helper'
require 'pd/survey_pipeline/daily_survey_decorator.rb'

module Pd::SurveyPipeline
  class DailySurveyParserTest < ActiveSupport::TestCase
    include Pd::WorkshopConstants

    test 'decorate survey summary for one form for one workshop' do
      form_id = 1
      form_name = '1'
      workshop = create :pd_workshop, course: COURSE_CSF, subject: SUBJECT_CSF_201

      parsed_data = {}
      parsed_data[:questions] = {
        form_id => {
          '1' => {type: 'radio', name: 'importance', text: 'CS is important?', order: 1,
            options: ['Disagree', 'Neutral', 'Agree'],
            option_map: {'Disagree': 1, 'Neutral': 2, 'Agree': 3}, answer_type: 'singleSelect'},
          '2' => {type: 'textarea', name: 'feedback', text: 'Free-format feedback', order: 2,
            answer_type: 'text'}
        }
      }

      parsed_data[:submissions] = {
        form_id => {
          1 => {workshop_id: workshop.id, user_id: 1, answers: {'1' => 'Agree', '2' => 'Feedback 1'}},
          2 => {workshop_id: workshop.id, user_id: 2, answers: {'1' => 'Agree', '2' => 'Feedback 2'}},
          3 => {workshop_id: workshop.id, user_id: 3, answers: {'1' => 'Neutral', '2' => 'Feedback 3'}},
          4 => {workshop_id: workshop.id, user_id: 4, answers: {'1' => 'Disagree', '2' => ''}},
        }
      }

      summary_data = [
        {workshop_id: workshop.id, form_id: 1, name: 'importance',
          reducer: 'histogram', reducer_result: {'Agree': 2, 'Neutral': 1, 'Disagree': 1}},
        {workshop_id: workshop.id, form_id: 1, name: 'feedback',
          reducer: 'no_op', reducer_result: ['Feedback 1', 'Feedback 2', 'Feedback 3']}
      ]

      expected_result = {
        course_name: COURSE_CSF,
        questions: {
          form_id => {
            general: {
              'importance' => parsed_data[:questions][form_id]['1'].except(:name),
              'feedback' => parsed_data[:questions][form_id]['2'].except(:name),
            }
          }
        },
        this_workshop: {
          form_name => {
            response_count: 4,
            general: {
              'importance' => {'Agree': 2, 'Neutral': 1, 'Disagree': 1},
              'feedback' => ['Feedback 1', 'Feedback 2', 'Feedback 3']
            }
          }
        },
        all_my_workshops: {},
        facilitators: {},
        facilitator_averages: {},
        facilitator_response_counts: {}
      }

      result = DailySurveyDecorator.decorate summary_data: summary_data, parsed_data: parsed_data

      assert_equal expected_result, result
    end
  end
end
