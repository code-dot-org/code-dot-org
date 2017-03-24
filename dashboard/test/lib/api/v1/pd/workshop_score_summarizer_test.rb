require 'test_helper'
require_relative "#{Rails.root}/../pegasus/forms/pd_workshop_survey"

module Api::V1::Pd
  class WorkshopScoreSummarizerTest < ActiveSupport::TestCase
    include WorkshopScoreSummarizer

    setup do
      # One teacher loved the workshop - they gave the best possible answer to each question
      happy_teacher_question_responses = {}

      FREE_RESPONSE_QUESTIONS.each do |question|
        happy_teacher_question_responses[question] = 'Great!'
      end

      [
        WorkshopScoreSummarizer::FACILITATOR_EFFECTIVENESS_QUESTIONS,
        WorkshopScoreSummarizer::TEACHER_ENGAGEMENT_QUESTIONS,
      ].flatten.each do |question|
        happy_teacher_question_responses[question] = get_best_response_for_question(question, PdWorkshopSurvey::OPTIONS)
      end

      OVERALL_SUCCESS_QUESTIONS.each do |question|
        happy_teacher_question_responses[question] = PdWorkshopSurvey::AGREE_SCALE_OPTIONS.last
      end

      happy_teacher_response = {}
      happy_teacher_response[:data] = happy_teacher_question_responses.to_json
      @some_dumb_object = {}
      PEGASUS_DB.stubs(:[]).returns(@some_dumb_object)
      @some_dumb_object.stubs(:where).returns([happy_teacher_response])

      @workshop = create(:pd_workshop, facilitators: [create(:facilitator)])
      create(:pd_enrollment, workshop: @workshop)
      @workshops = [@workshop]
    end

    test 'one happy teacher' do
      expected_results = {
        number_teachers: 1,
        response_count: 1,
        facilitator_effectiveness: 5,
        how_much_learned_s: 5,
        how_motivating_s: 5,
        how_clearly_presented_s: 5,
        how_interesting_s: 5,
        how_often_given_feedback_s: 5,
        how_comfortable_asking_questions_s: 5,
        how_often_taught_new_things_s: 5,
        teacher_engagement: 5,
        how_much_participated_s: 5,
        how_often_talk_about_ideas_outside_s: 5,
        how_often_lost_track_of_time_s: 5,
        how_excited_before_s: 5,
        overall_how_interested_s: 5,
        overall_success: 6,
        more_prepared_than_before_s: 6,
        know_where_to_go_for_help_s: 6,
        suitable_for_my_experience_s: 6,
        would_recommend_s: 6,
        part_of_community_s: 6,
        things_facilitator_did_well_s: ['Great!'],
        things_facilitator_could_improve_s: ['Great!'],
        things_you_liked_s: ['Great!'],
        things_you_would_change_s: ['Great!'],
        anything_else_s: ['Great!']
      }

      expected_facilitator_results = Hash.new
      expected_facilitator_results[@workshop.facilitators.first.name] = expected_results.reject {|k, _| FREE_RESPONSE_QUESTIONS.include?(k)}

      actual_results, actual_facilitator_results = get_score_for_workshops(@workshops, facilitator_breakdown: true, include_free_responses: true)
      assert_equal expected_results, actual_results
      assert_equal expected_facilitator_results, actual_facilitator_results
    end

    private

    def get_best_response_for_question(question, answers)
      answers[question].last
    end
  end
end
