require 'test_helper'
require_relative "#{Rails.root}/../pegasus/forms/pd_workshop_survey"

module Api::V1::Pd
  class WorkshopScoreSummarizerTest < ActiveSupport::TestCase
    include WorkshopScoreSummarizer

    TEST_FACILITATORS = ["Tom", "Dick", "Harry"]

    setup do
      # One teacher loved the workshop - they gave the best possible answer to
      # each question
      happy_teacher_question_responses = {}

      [
        WorkshopScoreSummarizer::FACILITATOR_EFFECTIVENESS_QUESTIONS,
        WorkshopScoreSummarizer::TEACHER_ENGAGEMENT_QUESTIONS,
        FREE_RESPONSE_QUESTIONS
      ].flatten.each do |question|
        happy_teacher_question_responses[question] = get_best_response_for_question(question, PdWorkshopSurvey::OPTIONS)
      end

      OVERALL_SUCCESS_QUESTIONS.each do |question|
        happy_teacher_question_responses[question] = PdWorkshopSurvey::AGREE_SCALE_OPTIONS.last
      end

      WorkshopScoreSummarizer::FACILITATOR_SPECIFIC_QUESTIONS.each do |question|
        happy_teacher_question_responses[question] = {}
        TEST_FACILITATORS.each do |facilitator|
          happy_teacher_question_responses[question][facilitator] = get_best_response_for_question(question, PdWorkshopSurvey::OPTIONS)
        end
      end

      happy_teacher_response = {}
      happy_teacher_response[:data] = happy_teacher_question_responses.to_json

      # Another teacher hated the workshop - they gave the worst possible answer
      # to each question
      angry_teacher_question_responses = {}
      [
        WorkshopScoreSummarizer::FACILITATOR_EFFECTIVENESS_QUESTIONS,
        WorkshopScoreSummarizer::TEACHER_ENGAGEMENT_QUESTIONS,
        FREE_RESPONSE_QUESTIONS
      ].flatten.each do |question|
        angry_teacher_question_responses[question] = get_worst_response_for_question(question, PdWorkshopSurvey::OPTIONS)
      end

      OVERALL_SUCCESS_QUESTIONS.each do |question|
        angry_teacher_question_responses[question] = PdWorkshopSurvey::AGREE_SCALE_OPTIONS.first
      end

      WorkshopScoreSummarizer::FACILITATOR_SPECIFIC_QUESTIONS.each do |question|
        angry_teacher_question_responses[question] = {}
        TEST_FACILITATORS.each do |facilitator|
          angry_teacher_question_responses[question][facilitator] = get_worst_response_for_question(question, PdWorkshopSurvey::OPTIONS)
        end
      end

      # And baby bear was conflicted - they gave some good and some bad answers
      mixed_teacher_question_responses = {}

      WorkshopScoreSummarizer::FACILITATOR_EFFECTIVENESS_QUESTIONS.each do |question|
        mixed_teacher_question_responses[question] = get_worst_response_for_question(question, PdWorkshopSurvey::OPTIONS)
      end
      WorkshopScoreSummarizer::TEACHER_ENGAGEMENT_QUESTIONS.each do |question|
        mixed_teacher_question_responses[question] = get_best_response_for_question(question, PdWorkshopSurvey::OPTIONS)
      end
      FREE_RESPONSE_QUESTIONS.each do |question|
        mixed_teacher_question_responses[question] = get_worst_response_for_question(question, PdWorkshopSurvey::OPTIONS)
      end

      OVERALL_SUCCESS_QUESTIONS.each do |question|
        mixed_teacher_question_responses[question] = PdWorkshopSurvey::AGREE_SCALE_OPTIONS.first
      end

      WorkshopScoreSummarizer::FACILITATOR_SPECIFIC_QUESTIONS.each do |question|
        mixed_teacher_question_responses[question] = {}
        TEST_FACILITATORS.each_with_index do |facilitator, i|
          mixed_teacher_question_responses[question][facilitator] =
            if i.even?
              get_worst_response_for_question(question, PdWorkshopSurvey::OPTIONS)
            else
              get_best_response_for_question(question, PdWorkshopSurvey::OPTIONS)
            end
        end
      end

      @happy_teacher_response = {data: happy_teacher_question_responses.to_json}
      @angry_teacher_response = {data: angry_teacher_question_responses.to_json}
      @mixed_teacher_response = {data: mixed_teacher_question_responses.to_json}

      facilitators = TEST_FACILITATORS.map do |facilitator_name|
        create(:facilitator, name: facilitator_name)
      end

      @pegasus_db_stub = {}
      PEGASUS_DB.stubs(:[]).returns(@pegasus_db_stub)

      @workshop = create(:pd_workshop, facilitators: facilitators)
      create(:pd_enrollment, workshop: @workshop)
      @workshops = [@workshop]
    end

    test 'one happy teacher' do
      @pegasus_db_stub.stubs(:where).returns([@happy_teacher_response])

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
        things_facilitator_did_well_s: ['Great!', 'Great!', 'Great!'],
        things_facilitator_could_improve_s: ['Great!', 'Great!', 'Great!'],
        things_you_liked_s: ['Great!'],
        things_you_would_change_s: ['Great!'],
        anything_else_s: ['Great!']
      }

      validate(expected_results)
    end

    test 'one angry teacher' do
      @pegasus_db_stub.stubs(:where).returns([@angry_teacher_response])

      expected_results = {
        number_teachers: 1,
        response_count: 1,
        facilitator_effectiveness: 1,
        how_much_learned_s: 1,
        how_motivating_s: 1,
        how_clearly_presented_s: 1,
        how_interesting_s: 1,
        how_often_given_feedback_s: 1,
        how_comfortable_asking_questions_s: 1,
        how_often_taught_new_things_s: 1,
        teacher_engagement: 1,
        how_much_participated_s: 1,
        how_often_talk_about_ideas_outside_s: 1,
        how_often_lost_track_of_time_s: 1,
        how_excited_before_s: 1,
        overall_how_interested_s: 1,
        overall_success: 1,
        more_prepared_than_before_s: 1,
        know_where_to_go_for_help_s: 1,
        suitable_for_my_experience_s: 1,
        would_recommend_s: 1,
        part_of_community_s: 1,
        things_facilitator_did_well_s: ['Lousy :(', 'Lousy :(', 'Lousy :('],
        things_facilitator_could_improve_s: ['Lousy :(', 'Lousy :(', 'Lousy :('],
        things_you_liked_s: ['Lousy :('],
        things_you_would_change_s: ['Lousy :('],
        anything_else_s: ['Lousy :(']
      }

      validate(expected_results)
    end

    test 'one mixed teacher' do
      @pegasus_db_stub.stubs(:where).returns([@mixed_teacher_response])

      expected_results = {
        number_teachers: 1,
        response_count: 1,
        facilitator_effectiveness: 1.95,
        how_much_learned_s: 1,
        how_motivating_s: 1,
        how_clearly_presented_s: 2.33,
        how_interesting_s: 2.33,
        how_often_given_feedback_s: 2.33,
        how_comfortable_asking_questions_s: 2.33,
        how_often_taught_new_things_s: 2.33,
        teacher_engagement: 5,
        how_much_participated_s: 5,
        how_often_talk_about_ideas_outside_s: 5,
        how_often_lost_track_of_time_s: 5,
        how_excited_before_s: 5,
        overall_how_interested_s: 5,
        overall_success: 1,
        more_prepared_than_before_s: 1,
        know_where_to_go_for_help_s: 1,
        suitable_for_my_experience_s: 1,
        would_recommend_s: 1,
        part_of_community_s: 1,
        things_facilitator_did_well_s: ['Lousy :(', 'Great!', 'Lousy :('],
        things_facilitator_could_improve_s: ['Lousy :(', 'Great!', 'Lousy :('],
        things_you_liked_s: ['Lousy :('],
        things_you_would_change_s: ['Lousy :('],
        anything_else_s: ['Lousy :(']
      }

      expected_facilitator_results = {
        "Tom" => {
          response_count: 1,
          number_teachers: 1,
          facilitator_effectiveness: 1.0,
          how_much_learned_s: 1.0,
          how_motivating_s: 1.0,
          how_clearly_presented_s: 1.0,
          how_interesting_s: 1.0,
          how_often_given_feedback_s: 1.0,
          how_comfortable_asking_questions_s: 1.0,
          how_often_taught_new_things_s: 1.0,
          teacher_engagement: 5.0,
          how_much_participated_s: 5.0,
          how_often_talk_about_ideas_outside_s: 5.0,
          how_often_lost_track_of_time_s: 5.0,
          how_excited_before_s: 5.0,
          overall_how_interested_s: 5.0,
          overall_success: 1.0,
          more_prepared_than_before_s: 1.0,
          know_where_to_go_for_help_s: 1.0,
          suitable_for_my_experience_s: 1.0,
          would_recommend_s: 1.0,
          part_of_community_s: 1.0
        },
        "Dick" => {
          response_count: 1,
          number_teachers: 1,
          facilitator_effectiveness: 3.86,
          how_much_learned_s: 1.0,
          how_motivating_s: 1.0,
          how_clearly_presented_s: 5.0,
          how_interesting_s: 5.0,
          how_often_given_feedback_s: 5.0,
          how_comfortable_asking_questions_s: 5.0,
          how_often_taught_new_things_s: 5.0,
          teacher_engagement: 5.0,
          how_much_participated_s: 5.0,
          how_often_talk_about_ideas_outside_s: 5.0,
          how_often_lost_track_of_time_s: 5.0,
          how_excited_before_s: 5.0,
          overall_how_interested_s: 5.0,
          overall_success: 1.0,
          more_prepared_than_before_s: 1.0,
          know_where_to_go_for_help_s: 1.0,
          suitable_for_my_experience_s: 1.0,
          would_recommend_s: 1.0,
          part_of_community_s: 1.0
        },
        "Harry" => {
          response_count: 1,
          number_teachers: 1,
          facilitator_effectiveness: 1.0,
          how_much_learned_s: 1.0,
          how_motivating_s: 1.0,
          how_clearly_presented_s: 1.0,
          how_interesting_s: 1.0,
          how_often_given_feedback_s: 1.0,
          how_comfortable_asking_questions_s: 1.0,
          how_often_taught_new_things_s: 1.0,
          teacher_engagement: 5.0,
          how_much_participated_s: 5.0,
          how_often_talk_about_ideas_outside_s: 5.0,
          how_often_lost_track_of_time_s: 5.0,
          how_excited_before_s: 5.0,
          overall_how_interested_s: 5.0,
          overall_success: 1.0,
          more_prepared_than_before_s: 1.0,
          know_where_to_go_for_help_s: 1.0,
          suitable_for_my_experience_s: 1.0,
          would_recommend_s: 1.0,
          part_of_community_s: 1.0
        }
      }

      validate(expected_results, expected_facilitator_results)
    end

    test 'one angry and one happy teacher' do
      @pegasus_db_stub.stubs(:where).returns([@happy_teacher_response, @angry_teacher_response])

      expected_results = {
        number_teachers: 1,
        response_count: 2,
        facilitator_effectiveness: 3,
        how_much_learned_s: 3,
        how_motivating_s: 3,
        how_clearly_presented_s: 3,
        how_interesting_s: 3,
        how_often_given_feedback_s: 3,
        how_comfortable_asking_questions_s: 3,
        how_often_taught_new_things_s: 3,
        teacher_engagement: 3,
        how_much_participated_s: 3,
        how_often_talk_about_ideas_outside_s: 3,
        how_often_lost_track_of_time_s: 3,
        how_excited_before_s: 3,
        overall_how_interested_s: 3,
        overall_success: 3.5,
        more_prepared_than_before_s: 3.5,
        know_where_to_go_for_help_s: 3.5,
        suitable_for_my_experience_s: 3.5,
        would_recommend_s: 3.5,
        part_of_community_s: 3.5,
        things_facilitator_did_well_s: ['Great!', 'Great!', 'Great!', 'Lousy :(', 'Lousy :(', 'Lousy :('],
        things_facilitator_could_improve_s: ['Great!', 'Great!', 'Great!', 'Lousy :(', 'Lousy :(', 'Lousy :('],
        things_you_liked_s: ['Great!', 'Lousy :('],
        things_you_would_change_s: ['Great!', 'Lousy :('],
        anything_else_s: ['Great!', 'Lousy :(']
      }

      validate(expected_results)
    end

    private

    def validate(expected_results, expected_facilitator_results=nil)
      if expected_facilitator_results.nil?
        expected_facilitator_results = Hash.new
        TEST_FACILITATORS.each do |facilitator_name|
          expected_facilitator_results[facilitator_name] = expected_results.reject {|k, _| FREE_RESPONSE_QUESTIONS.include?(k)}
        end
      end

      actual_results, actual_facilitator_results = get_score_for_workshops(@workshops, facilitator_breakdown: true, include_free_responses: true)
      assert_equal expected_results, actual_results
      assert_equal expected_facilitator_results, actual_facilitator_results
    end

    def get_best_response_for_question(question, answers)
      if FREE_RESPONSE_QUESTIONS.include?(question)
        return 'Great!'
      end

      answers[question].last
    end

    def get_worst_response_for_question(question, answers)
      if FREE_RESPONSE_QUESTIONS.include?(question)
        return 'Lousy :('
      end

      answers[question].first
    end
  end
end
