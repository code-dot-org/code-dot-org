require 'test_helper'
require 'pd/survey_pipeline/survey_rollup_decorator.rb'

module Pd::SurveyPipeline
  class SurveyRollupDecoratorTest < ActiveSupport::TestCase
    test 'decorate empty roll-up results' do
      facilitator = create :facilitator
      workshop_id = 1
      related_workshop_ids = [workshop_id]

      # There is no survey submission for this workshop and facilitator combination
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

    test 'decorate basic roll-up results' do
      facilitator = create :facilitator
      workshop_id = 1
      related_workshop_ids = [workshop_id]
      form_id = 1

      input_data = {
        current_workshop_id: workshop_id,
        related_workshop_ids: related_workshop_ids,
        facilitator_id: facilitator.id,
        parsed_questions:
          {form_id => {
            1 => {name: 'overall_success_hash1'},
            2 => {name: 'teacher_engagement_hash1'},
            3 => {name: 'facilitator_effectiveness_hash1'}
          }}, #TODO
        question_categories: %w(overall_success teacher_engagement facilitator_effectiveness),
        workshop_submissions: [], #TODO
        facilitator_submissions: [], #TODO
        question_answer_joined: [], #TODO
        summaries: [
          {name: 'overall_success_hash1', reducer_result: 5.0},
          {name: 'teacher_engagement_hash1', reducer_result: 6.0},
          {name: 'facilitator_effectiveness_hash1', reducer_result: 7.0},
        ], #TODO
        errors: []
      }

      expected_result = {
        facilitators: {facilitator.id => facilitator.name},
        current_workshop: workshop_id,
        related_workshops: {facilitator.id => related_workshop_ids},
        facilitator_averages: {
          questions: {
            "overall_success_0" => nil,
            "teacher_engagement_0" => nil,
            "facilitator_effectiveness_0" => nil
          },
          facilitator.name => {
            "overall_success_0" => {all_my_workshops: 5.0},
            "overall_success" => {this_workshop: nil, all_my_workshops: 5.0},
            "teacher_engagement_0" => {all_my_workshops: 6.0},
            "teacher_engagement" => {this_workshop: nil, all_my_workshops: 6.0},
            "facilitator_effectiveness_0" => {all_my_workshops: 7.0},
            "facilitator_effectiveness" => {this_workshop: nil, all_my_workshops: 7.0},
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
  end
end
