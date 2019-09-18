require 'test_helper'
require 'pd/survey_pipeline/survey_rollup_decorator.rb'

module Pd::SurveyPipeline
  class SurveyRollupDecoratorTest < ActiveSupport::TestCase
    test 'decorate empty survey roll-up results' do
      facilitator = create :facilitator
      workshop_id = 1
      related_workshop_ids = [workshop_id]

      # There is no survey submission for this combination of workshop and facilitator
      input_data = {
        current_workshop_id: workshop_id,
        related_workshop_ids: related_workshop_ids,
        facilitator_id: facilitator.id,
        parsed_questions: {},
        question_categories: %w(overall_success teacher_engagement facilitator_effectiveness),
        workshop_submissions: [],
        facilitator_submissions: [],
        question_answer_joined: [],
        summaries: [],
        errors: []
      }

      expected_result = {
        facilitators: {facilitator.id => facilitator.name},
        current_workshop: workshop_id,
        related_workshops: {facilitator.id => related_workshop_ids},
        facilitator_averages: {
          questions: {},
          facilitator.name => {
            'overall_success' => {this_workshop: nil, all_my_workshops: nil},
            'teacher_engagement' => {this_workshop: nil, all_my_workshops: nil},
            'facilitator_effectiveness' => {this_workshop: nil, all_my_workshops: nil}
          }
        },
        facilitator_response_counts: {
          this_workshop: {facilitator.id => {}},
          all_my_workshops: {facilitator.id => {}}
        },
        errors: []
      }

      result = SurveyRollupDecorator.decorate_facilitator_rollup input_data

      assert_equal expected_result, result
    end

    test 'decorate simple non-empty survey roll-up results' do
      facilitator = create :facilitator

      # Create 2 workshops are of the same kind and have the same facilitator
      workshop = create :csp_academic_year_workshop, num_facilitators: 0
      workshop.facilitators << facilitator
      related_workshop = create :csp_academic_year_workshop, num_facilitators: 0
      related_workshop.facilitators << facilitator
      related_workshop_ids = [workshop.id, related_workshop.id]

      form_id = 1

      # Create 2 general workshop survey submissions for each workshop
      workshop_survey_submissions =
        create_list :pd_workshop_daily_survey, 2, pd_workshop: workshop, day: 1
      workshop_survey_submissions +=
        create_list :pd_workshop_daily_survey, 2, pd_workshop: related_workshop, day: 1

      input_data = {
        current_workshop_id: workshop.id,
        related_workshop_ids: related_workshop_ids,
        facilitator_id: facilitator.id,
        # @see DailySurveyParser.parse_questions for data format of parsed_questions
        parsed_questions:
          {form_id => {
            1 => {name: 'overall_success_hash1', text: 'Overall Success Sub-question 1'},
          }},
        question_categories: ['overall_success'],
        workshop_submissions: workshop_survey_submissions,
        facilitator_submissions: [],
        # @see DailySurveyJoiner for data format of question_answer_joined
        question_answer_joined: [
          {name: 'overall_success_hash1', answer: 5.0, workshop_id: workshop.id, submission_id: 1},
          {name: 'overall_success_hash1', answer: 5.0, workshop_id: workshop.id, submission_id: 2},
          {name: 'overall_success_hash1', answer: 7.0, workshop_id: related_workshop.id, submission_id: 3},
          {name: 'overall_success_hash1', answer: 7.0, workshop_id: related_workshop.id, submission_id: 4},
        ],
        summaries: [
          {name: 'overall_success_hash1', workshop_id: workshop.id, reducer_result: 5.0},
          {name: 'overall_success_hash1', reducer_result: 6.0},
        ],
        errors: []
      }

      expected_result = {
        facilitators: {facilitator.id => facilitator.name},
        current_workshop: workshop.id,
        related_workshops: {facilitator.id => related_workshop_ids},
        facilitator_averages: {
          questions: {
            "overall_success_0" => 'Overall Success Sub-question 1',
          },
          facilitator.name => {
            "overall_success_0" => {this_workshop: 5.0, all_my_workshops: 6.0},
            "overall_success" => {this_workshop: 5.0, all_my_workshops: 6.0},
          }
        },
        facilitator_response_counts: {
          this_workshop: {facilitator.id => {'Workshop submissions' => 2}},
          all_my_workshops: {facilitator.id => {'Workshop submissions' => 4}}
        },
        errors: []
      }

      result = SurveyRollupDecorator.decorate_facilitator_rollup input_data

      assert_equal expected_result, result
    end
  end
end
