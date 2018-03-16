require 'test_helper'
require_relative "#{Rails.root}/../pegasus/forms/pd_workshop_survey"

module Api::V1::Pd
  class WorkshopScoreSummarizerTest < ActiveSupport::TestCase
    include WorkshopScoreSummarizer

    TEST_FACILITATORS = ["Tom", "Dick", "Harry"]

    setup do
      # One teacher loved the workshop - they gave the best possible answer to
      # each question
      @happy_teacher_question_responses = {}

      [
        WorkshopScoreSummarizer::FACILITATOR_EFFECTIVENESS_QUESTIONS,
        WorkshopScoreSummarizer::TEACHER_ENGAGEMENT_QUESTIONS,
        FREE_RESPONSE_QUESTIONS
      ].flatten.each do |question|
        @happy_teacher_question_responses[question] = get_best_response_for_question(question, PdWorkshopSurvey::OPTIONS)
      end

      OVERALL_SUCCESS_QUESTIONS.each do |question|
        @happy_teacher_question_responses[question] = PdWorkshopSurvey::AGREE_SCALE_OPTIONS.last
      end

      WorkshopScoreSummarizer::FACILITATOR_SPECIFIC_QUESTIONS.each do |question|
        @happy_teacher_question_responses[question] = {}
        TEST_FACILITATORS.each do |facilitator|
          @happy_teacher_question_responses[question][facilitator] = get_best_response_for_question(question, PdWorkshopSurvey::OPTIONS)
        end
      end

      # Another teacher hated the workshop - they gave the worst possible answer
      # to each question
      @angry_teacher_question_responses = {}
      [
        WorkshopScoreSummarizer::FACILITATOR_EFFECTIVENESS_QUESTIONS,
        WorkshopScoreSummarizer::TEACHER_ENGAGEMENT_QUESTIONS,
        FREE_RESPONSE_QUESTIONS
      ].flatten.each do |question|
        @angry_teacher_question_responses[question] = get_worst_response_for_question(question, PdWorkshopSurvey::OPTIONS)
      end

      OVERALL_SUCCESS_QUESTIONS.each do |question|
        @angry_teacher_question_responses[question] = PdWorkshopSurvey::AGREE_SCALE_OPTIONS.first
      end

      WorkshopScoreSummarizer::FACILITATOR_SPECIFIC_QUESTIONS.each do |question|
        @angry_teacher_question_responses[question] = {}
        TEST_FACILITATORS.each do |facilitator|
          @angry_teacher_question_responses[question][facilitator] = get_worst_response_for_question(question, PdWorkshopSurvey::OPTIONS)
        end
      end

      @happy_teacher_response = {data: @happy_teacher_question_responses.to_json}
      @angry_teacher_response = {data: @angry_teacher_question_responses.to_json}

      @facilitators = TEST_FACILITATORS.map do |facilitator_name|
        create(:facilitator, name: facilitator_name)
      end

      @pegasus_db_stub = {}
      PEGASUS_DB.stubs(:[]).returns(@pegasus_db_stub)

      @workshop = create(:pd_workshop, facilitators: @facilitators)
      create(:pd_enrollment, workshop: @workshop)
      @workshops = [@workshop]

      AWS::S3.stubs(:download_from_bucket).returns(Hash[@workshop.course.to_sym, {}].to_json)

      @workshop_for_course = create :pd_workshop, num_facilitators: 1
      @other_workshop_for_course = create :pd_workshop, organizer: @workshop_for_course.organizer, num_facilitators: 1
    end

    test 'generate_summary_report makes appropriate calls to get_score_for_workshops without name filter' do
      summary_report_sequence = sequence('Sequence for summary report')

      expects(:get_score_for_workshops).with(
        workshops: [@workshop_for_course],
        include_free_responses: true,
        facilitator_name_filter: nil
      ).returns('Single workshop scores').in_sequence(summary_report_sequence)

      expects(:get_score_for_workshops).with(
        workshops: [@workshop_for_course, @other_workshop_for_course],
        include_free_responses: false,
        facilitator_name_filter: nil
      ).returns('All workshops for this course scores').in_sequence(summary_report_sequence)

      summary_report = generate_summary_report(
        workshop: @workshop_for_course,
        workshops: [@workshop_for_course, @other_workshop_for_course],
        course: @workshop_for_course.course
      )

      assert_equal(
        {
          this_workshop: 'Single workshop scores',
          all_my_workshops_for_course: 'All workshops for this course scores',
          all_workshops_for_course: {}
        }, summary_report
      )
    end

    test 'generate_summary_report makes appropriate calls to get_score_for_workshops with name filter' do
      summary_report_sequence = sequence('Sequence for summary report')

      name_filter = @workshop_for_course.facilitators.first.name

      expects(:get_score_for_workshops).with(
        workshops: [@workshop_for_course],
        include_free_responses: true,
        facilitator_name_filter: name_filter
      ).returns('Single workshop scores').in_sequence(summary_report_sequence)

      expects(:get_score_for_workshops).with(
        workshops: [@workshop_for_course, @other_workshop_for_course],
        include_free_responses: false,
        facilitator_name_filter: name_filter
      ).returns('All workshops for this course scores').in_sequence(summary_report_sequence)

      summary_report = generate_summary_report(
        workshop: @workshop_for_course,
        workshops: [@workshop_for_course, @other_workshop_for_course],
        course: @workshop_for_course.course,
        facilitator_name: name_filter
      )

      assert_equal(
        {
          this_workshop: 'Single workshop scores',
          all_my_workshops_for_course: 'All workshops for this course scores',
          all_workshops_for_course: {}
        }, summary_report
      )
    end

    test 'generate_summary_report makes appropriate calls to get_score_for_workshops for facilitator breakdown' do
      summary_report_sequence = sequence('Sequence for summary report')

      facilitator_1_name = @workshop_for_course.facilitators.first.name
      facilitator_2_name = @other_workshop_for_course.facilitators.first.name

      expects(:get_score_for_workshops).with(
        workshops: [@workshop_for_course, @other_workshop_for_course],
        include_free_responses: false,
        facilitator_name_filter: nil
      ).returns('All workshops for this course scores').in_sequence(summary_report_sequence)

      expects(:get_score_for_workshops).with(
        workshops: [@workshop_for_course],
        include_free_responses: false,
        facilitator_name_filter: facilitator_1_name
      ).returns("Scores for #{facilitator_1_name}")

      expects(:get_score_for_workshops).with(
        workshops: [@other_workshop_for_course],
        include_free_responses: false,
        facilitator_name_filter: facilitator_2_name
      ).returns("Scores for #{facilitator_2_name}")

      summary_report = generate_summary_report(
        workshop: nil,
        workshops: Pd::Workshop.where(id: [@workshop_for_course.id, @other_workshop_for_course.id]),
        course: @workshop_for_course.course,
        facilitator_breakdown: true
      )

      assert_equal(
        {
          all_my_workshops_for_course: 'All workshops for this course scores',
          all_workshops_for_course: {},
          facilitator_1_name => "Scores for #{facilitator_1_name}",
          facilitator_2_name => "Scores for #{facilitator_2_name}",
        }, summary_report
      )
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
      }], initialize_response_summaries(TEST_FACILITATORS)

      assert_equal [expected_response_summary, {
        how_clearly_presented_s: {'Tom' => 0},
        how_interesting_s: {'Tom' => 0},
        how_often_given_feedback_s: {'Tom' => 0},
        how_comfortable_asking_questions_s: {'Tom' => 0},
        how_often_taught_new_things_s: {'Tom' => 0},
      }, expected_free_response_summary, {
        things_facilitator_did_well_s: {'Tom' => []},
        things_facilitator_could_improve_s: {'Tom' => []}
      }], initialize_response_summaries(TEST_FACILITATORS, 'Tom')
    end

    test 'Generating sums without facilitator filter with extra component checking' do
      response_sums, facilitator_specific_response_sums, free_response_summary, facilitator_specific_free_response_sums = initialize_response_summaries(TEST_FACILITATORS)
      responses = [JSON.parse(@happy_teacher_response[:data]), JSON.parse(@angry_teacher_response[:data])]

      responses_per_facilitator = calculate_facilitator_name_frequencies(responses)

      generate_survey_response_sums(responses, response_sums, facilitator_specific_response_sums, nil)
      generate_free_response_sums(responses, free_response_summary, facilitator_specific_free_response_sums, responses_per_facilitator, nil)

      assert_equal(
        {
          'Tom' => 2,
          'Dick' => 2,
          'Harry' => 2,
        }, responses_per_facilitator
      )
      assert_equal(
        {
          how_much_learned_s: 6,
          how_motivating_s: 6,
          how_clearly_presented_s: 0,
          how_interesting_s: 0,
          how_often_given_feedback_s: 0,
          how_comfortable_asking_questions_s: 0,
          how_often_taught_new_things_s: 0,
          how_much_participated_s: 6,
          how_often_talk_about_ideas_outside_s: 6,
          how_often_lost_track_of_time_s: 6,
          how_excited_before_s: 6,
          overall_how_interested_s: 6,
          more_prepared_than_before_s: 7,
          know_where_to_go_for_help_s: 7,
          suitable_for_my_experience_s: 7,
          would_recommend_s: 7,
          part_of_community_s: 7
        }, response_sums
      )

      assert_equal(
        {
          how_clearly_presented_s: {'Tom' => 6, 'Dick' => 6, 'Harry' => 6},
          how_interesting_s: {'Tom' => 6, 'Dick' => 6, 'Harry' => 6},
          how_often_given_feedback_s: {'Tom' => 6, 'Dick' => 6, 'Harry' => 6},
          how_comfortable_asking_questions_s: {'Tom' => 6, 'Dick' => 6, 'Harry' => 6},
          how_often_taught_new_things_s: {'Tom' => 6, 'Dick' => 6, 'Harry' => 6},
        }, facilitator_specific_response_sums
      )

      assert_equal(
        {
          things_facilitator_did_well_s: {'Tom' => %w(Great! Lousy!), 'Dick' => %w(Great! Lousy!), 'Harry' => %w(Great! Lousy!)},
          things_facilitator_could_improve_s: {'Tom' => %w(Great! Lousy!), 'Dick' => %w(Great! Lousy!), 'Harry' => %w(Great! Lousy!)},
          things_you_liked_s: %w(Great! Lousy!),
          things_you_would_change_s: %w(Great! Lousy!),
          anything_else_s: %w(Great! Lousy!)
        }, free_response_summary
      )

      assert_equal(
        {
          things_facilitator_did_well_s: {'Tom' => %w(Great! Lousy!), 'Dick' => %w(Great! Lousy!), 'Harry' => %w(Great! Lousy!)},
          things_facilitator_could_improve_s: {'Tom' => %w(Great! Lousy!), 'Dick' => %w(Great! Lousy!), 'Harry' => %w(Great! Lousy!)}
        }, facilitator_specific_free_response_sums
      )

      response_summary = generate_response_averages(responses, response_sums, facilitator_specific_response_sums, responses_per_facilitator)
      response_summary.merge!(free_response_summary)

      assert_equal(
        {
          how_much_learned_s: 3.0,
          how_motivating_s: 3.0,
          how_clearly_presented_s: 3.0,
          how_interesting_s: 3.0,
          how_often_given_feedback_s: 3.0,
          how_comfortable_asking_questions_s: 3.0,
          how_often_taught_new_things_s: 3.0,
          how_much_participated_s: 3.0,
          how_often_talk_about_ideas_outside_s: 3.0,
          how_often_lost_track_of_time_s: 3.0,
          how_excited_before_s: 3.0,
          overall_how_interested_s: 3.0,
          more_prepared_than_before_s: 3.5,
          know_where_to_go_for_help_s: 3.5,
          suitable_for_my_experience_s: 3.5,
          would_recommend_s: 3.5,
          part_of_community_s: 3.5,
          things_facilitator_did_well_s: {'Tom' => %w(Great! Lousy!), 'Dick' => %w(Great! Lousy!), 'Harry' => %w(Great! Lousy!)},
          things_facilitator_could_improve_s: {'Tom' => %w(Great! Lousy!), 'Dick' => %w(Great! Lousy!), 'Harry' => %w(Great! Lousy!)},
          things_you_liked_s: %w(Great! Lousy!),
          things_you_would_change_s: %w(Great! Lousy!),
          anything_else_s: %w(Great! Lousy!)
        }, response_summary
      )
    end

    test 'Generating averages with facilitator filter' do
      @pegasus_db_stub.stubs(:where).returns([@happy_teacher_response, @angry_teacher_response])
      response_summary = get_score_for_workshops(workshops: @workshops, include_free_responses: true, facilitator_name_filter: 'Tom')

      assert_equal(
        {
          how_much_learned_s: 3.0,
          how_motivating_s: 3.0,
          how_clearly_presented_s: 3.0,
          how_interesting_s: 3.0,
          how_often_given_feedback_s: 3.0,
          how_comfortable_asking_questions_s: 3.0,
          how_often_taught_new_things_s: 3.0,
          how_much_participated_s: 3.0,
          how_often_talk_about_ideas_outside_s: 3.0,
          how_often_lost_track_of_time_s: 3.0,
          how_excited_before_s: 3.0,
          overall_how_interested_s: 3.0,
          more_prepared_than_before_s: 3.5,
          know_where_to_go_for_help_s: 3.5,
          suitable_for_my_experience_s: 3.5,
          would_recommend_s: 3.5,
          part_of_community_s: 3.5,
          things_facilitator_did_well_s: {'Tom' => %w(Great! Lousy!)},
          things_facilitator_could_improve_s: {'Tom' => %w(Great! Lousy!)},
          things_you_liked_s: %w(Great! Lousy!),
          things_you_would_change_s: %w(Great! Lousy!),
          anything_else_s: %w(Great! Lousy!),
          teacher_engagement: 3.0,
          overall_success: 3.5,
          facilitator_effectiveness: 3.0,
          number_teachers: 1,
          response_count: 2
        }, response_summary
      )
    end

    test 'Generating averages for non facilitator specific surveys' do
      non_facilitator_specific_happy_teacher = @happy_teacher_question_responses.merge(
        {
          how_clearly_presented_s: 'Extremely clearly',
          how_interesting_s: 'Extremely interesting',
          how_often_given_feedback_s: 'All the time',
          how_comfortable_asking_questions_s: 'Extremely comfortable',
          how_often_taught_new_things_s: 'All the time',
          things_facilitator_did_well_s: 'Great!',
          things_facilitator_could_improve_s: 'Great!'
        }
      )

      non_facilitator_specific_angry_teacher = @angry_teacher_question_responses.merge(
        {
          how_clearly_presented_s: 'Not at all clearly',
          how_interesting_s: 'Not at all interesting',
          how_often_given_feedback_s: 'Almost never',
          how_comfortable_asking_questions_s: 'Not at all comfortable',
          how_often_taught_new_things_s: 'Almost never',
          things_facilitator_did_well_s: 'Lousy!',
          things_facilitator_could_improve_s: 'Lousy!'
        }
      )

      @pegasus_db_stub.stubs(:where).returns(
        [{data: non_facilitator_specific_happy_teacher.to_json}, {data: non_facilitator_specific_angry_teacher.to_json}]
      )
      response_summary = get_score_for_workshops(workshops: @workshops, include_free_responses: true, facilitator_name_filter: 'Tom')

      assert_equal(
        {
          how_much_learned_s: 3.0,
          how_motivating_s: 3.0,
          how_clearly_presented_s: 3.0,
          how_interesting_s: 3.0,
          how_often_given_feedback_s: 3.0,
          how_comfortable_asking_questions_s: 3.0,
          how_often_taught_new_things_s: 3.0,
          how_much_participated_s: 3.0,
          how_often_talk_about_ideas_outside_s: 3.0,
          how_often_lost_track_of_time_s: 3.0,
          how_excited_before_s: 3.0,
          overall_how_interested_s: 3.0,
          more_prepared_than_before_s: 3.5,
          know_where_to_go_for_help_s: 3.5,
          suitable_for_my_experience_s: 3.5,
          would_recommend_s: 3.5,
          part_of_community_s: 3.5,
          things_facilitator_did_well_s: %w(Great! Lousy!),
          things_facilitator_could_improve_s: %w(Great! Lousy!),
          things_you_liked_s: %w(Great! Lousy!),
          things_you_would_change_s: %w(Great! Lousy!),
          anything_else_s: %w(Great! Lousy!),
          teacher_engagement: 3.0,
          overall_success: 3.5,
          facilitator_effectiveness: 3.0,
          number_teachers: 1,
          response_count: 2
        }, response_summary
      )
    end

    private

    def get_best_response_for_question(question, answers)
      if FREE_RESPONSE_QUESTIONS.include?(question)
        return 'Great!'
      end

      answers[question].last
    end

    def get_worst_response_for_question(question, answers)
      if FREE_RESPONSE_QUESTIONS.include?(question)
        return 'Lousy!'
      end

      answers[question].first
    end
  end
end
