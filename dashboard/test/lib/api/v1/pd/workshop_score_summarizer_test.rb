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

      @facilitators = TEST_FACILITATORS.map do |facilitator_name|
        create(:facilitator, name: facilitator_name)
      end

      @pegasus_db_stub = {}
      PEGASUS_DB.stubs(:[]).returns(@pegasus_db_stub)

      @workshop = create(:pd_workshop, facilitators: @facilitators)
      create(:pd_enrollment, workshop: @workshop)
      @workshops = [@workshop]
    end

    test 'one happy teacher' do
      @pegasus_db_stub.stubs(:where).returns([@happy_teacher_response])

      expected_results = {
        number_teachers: 0,
        response_count: 1,
        facilitator_effectiveness: 5.0,
        how_much_learned_s: 5.0,
        how_motivating_s: 5.0,
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
        overall_success: 6.0,
        more_prepared_than_before_s: 6.0,
        know_where_to_go_for_help_s: 6.0,
        suitable_for_my_experience_s: 6.0,
        would_recommend_s: 6.0,
        part_of_community_s: 6.0,
        things_facilitator_did_well_s: Hash[TEST_FACILITATORS.map {|facilitator| [facilitator, ['Great!']]}],
        things_facilitator_could_improve_s: Hash[TEST_FACILITATORS.map {|facilitator| [facilitator, ['Great!']]}],
        things_you_liked_s: ['Great!'],
        things_you_would_change_s: ['Great!'],
        anything_else_s: ['Great!']
      }

      validate(expected_results)
    end

    test 'one angry teacher' do
      @pegasus_db_stub.stubs(:where).returns([@angry_teacher_response])

      expected_results = {
        number_teachers: 0,
        response_count: 1,
        facilitator_effectiveness: 1.0,
        how_much_learned_s: 1.0,
        how_motivating_s: 1.0,
        how_clearly_presented_s: 1.0,
        how_interesting_s: 1.0,
        how_often_given_feedback_s: 1.0,
        how_comfortable_asking_questions_s: 1.0,
        how_often_taught_new_things_s: 1.0,
        teacher_engagement: 1.0,
        how_much_participated_s: 1.0,
        how_often_talk_about_ideas_outside_s: 1.0,
        how_often_lost_track_of_time_s: 1.0,
        how_excited_before_s: 1.0,
        overall_how_interested_s: 1.0,
        overall_success: 1.0,
        more_prepared_than_before_s: 1.0,
        know_where_to_go_for_help_s: 1.0,
        suitable_for_my_experience_s: 1.0,
        would_recommend_s: 1.0,
        part_of_community_s: 1.0,
        things_facilitator_did_well_s: Hash[TEST_FACILITATORS.map {|facilitator| [facilitator, ['Lousy :(']]}],
        things_facilitator_could_improve_s: Hash[TEST_FACILITATORS.map {|facilitator| [facilitator, ['Lousy :(']]}],
        things_you_liked_s: ['Lousy :('],
        things_you_would_change_s: ['Lousy :('],
        anything_else_s: ['Lousy :(']
      }

      validate(expected_results)
    end

    test 'one mixed teacher' do
      @pegasus_db_stub.stubs(:where).returns([@mixed_teacher_response])

      expected_results = {
        number_teachers: 0,
        response_count: 1,
        facilitator_effectiveness: 1.95,
        how_much_learned_s: 1,
        how_motivating_s: 1,
        how_clearly_presented_s: 2.33,
        how_interesting_s: 2.33,
        how_often_given_feedback_s: 2.33,
        how_comfortable_asking_questions_s: 2.33,
        how_often_taught_new_things_s: 2.33,
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
        part_of_community_s: 1.0,
        things_facilitator_did_well_s: {'Tom' => ['Lousy :('], 'Dick' => ['Great!'], 'Harry' => ['Lousy :(']},
        things_facilitator_could_improve_s: {'Tom' => ['Lousy :('], 'Dick' => ['Great!'], 'Harry' => ['Lousy :(']},
        things_you_liked_s: ['Lousy :('],
        things_you_would_change_s: ['Lousy :('],
        anything_else_s: ['Lousy :(']
      }

      validate(expected_results)
    end

    test 'one angry and one happy teacher' do
      @pegasus_db_stub.stubs(:where).returns([@happy_teacher_response, @angry_teacher_response])

      expected_results = {
        number_teachers: 0,
        response_count: 2,
        facilitator_effectiveness: 3.0,
        how_much_learned_s: 3.0,
        how_motivating_s: 3.0,
        how_clearly_presented_s: 3.0,
        how_interesting_s: 3.0,
        how_often_given_feedback_s: 3.0,
        how_comfortable_asking_questions_s: 3.0,
        how_often_taught_new_things_s: 3.0,
        teacher_engagement: 3.0,
        how_much_participated_s: 3.0,
        how_often_talk_about_ideas_outside_s: 3.0,
        how_often_lost_track_of_time_s: 3.0,
        how_excited_before_s: 3.0,
        overall_how_interested_s: 3.0,
        overall_success: 3.5,
        more_prepared_than_before_s: 3.5,
        know_where_to_go_for_help_s: 3.5,
        suitable_for_my_experience_s: 3.5,
        would_recommend_s: 3.5,
        part_of_community_s: 3.5,
        things_facilitator_did_well_s: Hash[TEST_FACILITATORS.map {|facilitator| [facilitator, ['Great!', 'Lousy :(']]}],
        things_facilitator_could_improve_s: Hash[TEST_FACILITATORS.map {|facilitator| [facilitator, ['Great!', 'Lousy :(']]}],
        things_you_liked_s: ['Great!', 'Lousy :('],
        things_you_would_change_s: ['Great!', 'Lousy :('],
        anything_else_s: ['Great!', 'Lousy :(']
      }

      validate(expected_results)
    end

    test 'correct averaging of facilitator specific questions' do
      csd_workshop = create(:pd_workshop, facilitators: @facilitators, course: Pd::Workshop::COURSE_CSD, subject: Pd::Workshop::SUBJECT_CSD_UNIT_3_4)

      responses = [
        {
          data: {
            how_often_given_feedback_s: {'Tom': 'Sometimes'}
          }.to_json
        }, {
          data: {
            how_often_given_feedback_s: {'Dick': 'Sometimes'}
          }.to_json
        }, {
          data: {
            how_often_given_feedback_s: {'Harry': 'Almost never'}
          }.to_json
        }, {
          data: {
            how_often_given_feedback_s: {'Tom': 'All the time'}
          }.to_json
        }
      ]

      @pegasus_db_stub.stubs(:where).returns(responses)

      # average_score = get_score_for_workshops([csd_workshop])
      # assert_equal 3.0, average_score[:how_often_given_feedback_s]

      assert_equal 4.0, (get_score_for_workshops([csd_workshop], facilitator_name_filter: 'Tom'))[:how_often_given_feedback_s]
      assert_equal 3.0, (get_score_for_workshops([csd_workshop], facilitator_name_filter: 'Dick'))[:how_often_given_feedback_s]
      assert_equal 1.0, (get_score_for_workshops([csd_workshop], facilitator_name_filter: 'Harry'))[:how_often_given_feedback_s]

      assert_equal([{'Tom' => 2, 'Dick' => 1, 'Harry' => 1}, true], calculate_facilitator_name_frequencies(responses.map {|response| JSON.parse response[:data]}, TEST_FACILITATORS))
    end

    test 'Response summary initialization' do
      expected_response_summary = {
        how_much_learned_s: 0,
        how_motivating_s: 0,
        how_clearly_presented_s: 0,
        how_interesting_s: 0,
        how_often_given_feedback_s: 0,
        how_comfortable_asking_questions_s: 0,
        how_often_taught_new_things_s: 0,
        how_much_participated_s: 0,
        how_often_talk_about_ideas_outside_s: 0,
        how_often_lost_track_of_time_s: 0,
        how_excited_before_s: 0,
        overall_how_interested_s: 0,
        more_prepared_than_before_s: 0,
        know_where_to_go_for_help_s: 0,
        suitable_for_my_experience_s: 0,
        would_recommend_s: 0,
        part_of_community_s: 0
      }

      expected_free_response_summary = {
        things_facilitator_did_well_s: [],
        things_facilitator_could_improve_s: [],
        things_you_liked_s: [],
        things_you_would_change_s: [],
        anything_else_s: []
      }

      assert_equal [expected_response_summary, {
        how_clearly_presented_s: {'Tom' => 0, 'Dick' => 0, 'Harry' => 0},
        how_interesting_s: {'Tom' => 0, 'Dick' => 0, 'Harry' => 0},
        how_often_given_feedback_s: {'Tom' => 0, 'Dick' => 0, 'Harry' => 0},
        how_comfortable_asking_questions_s: {'Tom' => 0, 'Dick' => 0, 'Harry' => 0},
        how_often_taught_new_things_s: {'Tom' => 0, 'Dick' => 0, 'Harry' => 0},
      }, expected_free_response_summary, {
        things_facilitator_did_well_s: {'Tom' => [], 'Dick' => [], 'Harry' => []},
        things_facilitator_could_improve_s: {'Tom' => [], 'Dick' => [], 'Harry' => []}
      }], initialize_response_summaries(nil, TEST_FACILITATORS)

      assert_equal [expected_response_summary, {
        how_clearly_presented_s: {'Tom' => 0},
        how_interesting_s: {'Tom' => 0},
        how_often_given_feedback_s: {'Tom' => 0},
        how_comfortable_asking_questions_s: {'Tom' => 0},
        how_often_taught_new_things_s: {'Tom' => 0},
      }, expected_free_response_summary, {
        things_facilitator_did_well_s: {'Tom' => []},
        things_facilitator_could_improve_s: {'Tom' => []}
      }], initialize_response_summaries('Tom', TEST_FACILITATORS)
    end

    test 'Generating sums without facilitator filter' do
      response_sums, facilitator_specific_response_sums, free_response_summary, facilitator_specific_free_response_sums = initialize_response_summaries(nil, TEST_FACILITATORS)
      response = JSON.parse @happy_teacher_response[:data]
      generate_survey_response_sums([response, response], response_sums, facilitator_specific_response_sums, nil)
      generate_free_response_sums([response, response], free_response_summary, facilitator_specific_free_response_sums, nil)

      assert_equal(
        {
          how_much_learned_s: 10,
          how_motivating_s: 10,
          how_clearly_presented_s: 0,
          how_interesting_s: 0,
          how_often_given_feedback_s: 0,
          how_comfortable_asking_questions_s: 0,
          how_often_taught_new_things_s: 0,
          how_much_participated_s: 10,
          how_often_talk_about_ideas_outside_s: 10,
          how_often_lost_track_of_time_s: 10,
          how_excited_before_s: 10,
          overall_how_interested_s: 10,
          more_prepared_than_before_s: 12,
          know_where_to_go_for_help_s: 12,
          suitable_for_my_experience_s: 12,
          would_recommend_s: 12,
          part_of_community_s: 12
      }, response_sums)

      assert_equal(
        {
          how_clearly_presented_s: {'Tom' => 10, 'Dick' => 10, 'Harry' => 10},
          how_interesting_s: {'Tom' => 10, 'Dick' => 10, 'Harry' => 10},
          how_often_given_feedback_s: {'Tom' => 10, 'Dick' => 10, 'Harry' => 10},
          how_comfortable_asking_questions_s: {'Tom' => 10, 'Dick' => 10, 'Harry' => 10},
          how_often_taught_new_things_s: {'Tom' => 10, 'Dick' => 10, 'Harry' => 10},
      }, facilitator_specific_response_sums)

      assert_equal(
        {
          things_facilitator_did_well_s: [],
          things_facilitator_could_improve_s: [],
          things_you_liked_s: %w(Great! Great!),
          things_you_would_change_s: %w(Great! Great!),
          anything_else_s: %w(Great! Great!)
        }, free_response_summary
      )

      assert_equal(
        {
          things_facilitator_did_well_s: {'Tom' => %w(Great! Great!), 'Dick' => %w(Great! Great!), 'Harry' => %w(Great! Great!)},
          things_facilitator_could_improve_s: {'Tom' => %w(Great! Great!), 'Dick' => %w(Great! Great!), 'Harry' => %w(Great! Great!)}
        }, facilitator_specific_free_response_sums
      )
    end

    test 'Generating sums with facilitator filter' do
      response_sums, facilitator_specific_response_sums, free_response_summary, facilitator_specific_free_response_sums = initialize_response_summaries('Tom', TEST_FACILITATORS)
      response = JSON.parse @happy_teacher_response[:data]
      generate_survey_response_sums([response, response], response_sums, facilitator_specific_response_sums, 'Tom')
      generate_free_response_sums([response, response], free_response_summary, facilitator_specific_free_response_sums, 'Tom')

      assert_equal(
        {
          how_much_learned_s: 10,
          how_motivating_s: 10,
          how_clearly_presented_s: 0,
          how_interesting_s: 0,
          how_often_given_feedback_s: 0,
          how_comfortable_asking_questions_s: 0,
          how_often_taught_new_things_s: 0,
          how_much_participated_s: 10,
          how_often_talk_about_ideas_outside_s: 10,
          how_often_lost_track_of_time_s: 10,
          how_excited_before_s: 10,
          overall_how_interested_s: 10,
          more_prepared_than_before_s: 12,
          know_where_to_go_for_help_s: 12,
          suitable_for_my_experience_s: 12,
          would_recommend_s: 12,
          part_of_community_s: 12
        }, response_sums)

      assert_equal(
        {
          how_clearly_presented_s: {'Tom' => 10},
          how_interesting_s: {'Tom' => 10},
          how_often_given_feedback_s: {'Tom' => 10},
          how_comfortable_asking_questions_s: {'Tom' => 10},
          how_often_taught_new_things_s: {'Tom' => 10},
        }, facilitator_specific_response_sums)

      assert_equal(
        {
          things_facilitator_did_well_s: [],
          things_facilitator_could_improve_s: [],
          things_you_liked_s: %w(Great! Great!),
          things_you_would_change_s: %w(Great! Great!),
          anything_else_s: %w(Great! Great!)
        }, free_response_summary
      )

      assert_equal(
        {
          things_facilitator_did_well_s: {'Tom' => %w(Great! Great!)},
          things_facilitator_could_improve_s: {'Tom' => %w(Great! Great!)}
        }, facilitator_specific_free_response_sums
      )
    end

    test 'Generating sums for non-facilitator specific surveys' do
      response_sums, facilitator_specific_response_sums, free_response_summary, facilitator_specific_free_response_sums = initialize_response_summaries('Tom', TEST_FACILITATORS)
      response = JSON.parse @happy_teacher_response[:data]
      response.merge!({
        how_clearly_presented_s: 'Extremely clearly',
        how_interesting_s: 'Extremely interesting',
        how_often_given_feedback_s: 'All the time',
        how_comfortable_asking_questions_s: 'Extremely comfortable',
        how_often_taught_new_things_s: 'All the time',
        things_facilitator_did_well_s: 'Great!',
        things_facilitator_could_improve_s: 'Great!',
      })

      generate_survey_response_sums([response, response], response_sums, facilitator_specific_response_sums, 'Tom')
      generate_free_response_sums([response, response], free_response_summary, facilitator_specific_free_response_sums, 'Tom')

      assert_equal(
        {
          how_much_learned_s: 10,
          how_motivating_s: 10,
          how_clearly_presented_s: 10,
          how_interesting_s: 10,
          how_often_given_feedback_s: 10,
          how_comfortable_asking_questions_s: 10,
          how_often_taught_new_things_s: 10,
          how_much_participated_s: 10,
          how_often_talk_about_ideas_outside_s: 10,
          how_often_lost_track_of_time_s: 10,
          how_excited_before_s: 10,
          overall_how_interested_s: 10,
          more_prepared_than_before_s: 12,
          know_where_to_go_for_help_s: 12,
          suitable_for_my_experience_s: 12,
          would_recommend_s: 12,
          part_of_community_s: 12
        }, response_sums)

      assert_equal(
        {
          things_facilitator_did_well_s: %w(Great! Great!),
          things_facilitator_could_improve_s: %w(Great! Great!),
          things_you_liked_s: %w(Great! Great!),
          things_you_would_change_s: %w(Great! Great!),
          anything_else_s: %w(Great! Great!)
        }, free_response_summary
      )
    end

    private

    def validate(expected_results)
      actual_results = get_score_for_workshops(@workshops, include_free_responses: true)
      assert_equal expected_results, actual_results
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
