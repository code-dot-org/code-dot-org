require 'test_helper'
require_relative "#{Rails.root}/../pegasus/forms/pd_workshop_survey"

module Api::V1::Pd
  class WorkshopScoreSummarizerTest < ActiveSupport::TestCase
    include WorkshopScoreSummarizer

    TEST_FACILITATORS = ["Curly", "Larry", "Moe"]

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
      @declined_response = {
        data: {
          consent_b: '0'
        }.to_json
      }

      @facilitators = TEST_FACILITATORS.map do |facilitator_name|
        create(:facilitator, name: facilitator_name)
      end

      @pegasus_db_stub = {}
      PEGASUS_DB.stubs(:[]).returns(@pegasus_db_stub)

      @workshop = create :pd_workshop, facilitators: @facilitators, enrolled_and_attending_users: 2, num_sessions: 1
      create(:pd_enrollment, workshop: @workshop)
      @workshops = [@workshop]

      AWS::S3.stubs(:download_from_bucket).returns(Hash[@workshop.course.to_sym, {}].to_json)

      @workshop_for_course = create :pd_workshop, num_facilitators: 1, enrolled_and_attending_users: 2, num_sessions: 1
      @other_workshop_for_course = create :pd_workshop, organizer: @workshop_for_course.organizer, num_facilitators: 1, enrolled_and_attending_users: 2
    end

    test 'generate summary report returns expected columns for one good workshop, and one bad workshop' do
      # The first workshop went great
      good_workshop = create :pd_workshop, facilitators: @facilitators[0..1], enrolled_and_attending_users: 2, num_sessions: 1
      happy_response_1 = @happy_teacher_question_responses.merge(
        {
          how_clearly_presented_s: {'Curly' => 'Extremely clearly'},
          how_interesting_s: {'Curly' => 'Extremely interesting'},
          how_often_given_feedback_s: {'Curly' => 'All the time'},
          how_comfortable_asking_questions_s: {'Curly' => 'Extremely comfortable'},
          how_often_taught_new_things_s: {'Curly' => 'All the time'},
          things_facilitator_did_well_s: {'Curly' => 'Curly did everything great'},
          things_facilitator_could_improve_s: {'Curly' => 'Curly was perfect'}
        }
      )

      happy_response_2 = @happy_teacher_question_responses.merge(
        {
          how_clearly_presented_s: {'Curly' => 'Extremely clearly', 'Larry' => 'Quite clearly'},
          how_interesting_s: {'Curly' => 'Extremely interesting', 'Larry' => 'Quite interesting'},
          how_often_given_feedback_s: {'Curly' => 'All the time', 'Larry' => 'Often'},
          how_comfortable_asking_questions_s: {'Curly' => 'Extremely comfortable', 'Larry' => 'Quite comfortable'},
          how_often_taught_new_things_s: {'Curly' => 'All the time', 'Larry' => 'Often'},
          things_facilitator_did_well_s: {'Curly' => 'Curly was awesome', 'Larry' => 'Larry did pretty good'},
          things_facilitator_could_improve_s: {'Curly' => 'Curly shouldnt change a thing', 'Larry' => 'Larry doesnt need to improve'}
        }
      )

      good_workshop_responses = [{data: happy_response_1.to_json}, {data: happy_response_2.to_json}]

      # The second workshop went poorly
      bad_workshop = create :pd_workshop, facilitators: @facilitators[1..2], enrolled_and_attending_users: 2, num_sessions: 1
      bad_response = @angry_teacher_question_responses.merge(
        {
          how_clearly_presented_s: {'Moe' => 'Not at all clearly', 'Larry' => 'Not at all clearly'},
          how_interesting_s: {'Moe' => 'Not at all interesting', 'Larry' => 'Not at all interesting'},
          how_often_given_feedback_s: {'Moe' => 'Almost never', 'Larry' => 'Almost never'},
          how_comfortable_asking_questions_s: {'Moe' => 'Not at all comfortable', 'Larry' => 'Not at all comfortable'},
          how_often_taught_new_things_s: {'Moe' => 'Almost never', 'Larry' => 'Almost never'},
          things_facilitator_did_well_s: {'Moe' => 'Moe did nothing great', 'Larry' => 'Larry did not do great'},
          things_facilitator_could_improve_s: {'Moe' => 'Moe was awful', 'Larry' => 'Larry was awful'}
        }
      )
      bad_workshop_responses = [{data: bad_response.to_json}, {data: bad_response.to_json}]
      workshops = [good_workshop, bad_workshop]

      # Expected response data
      good_workshop_averages = {
        how_much_learned_s: 5.0,
        how_motivating_s: 5.0,
        how_often_talk_about_ideas_outside_s: 5.0,
        how_often_lost_track_of_time_s: 5.0,
        how_excited_before_s: 5.0,
        overall_how_interested_s: 5.0,
        more_prepared_than_before_s: 6.0,
        know_where_to_go_for_help_s: 6.0,
        suitable_for_my_experience_s: 6.0,
        would_recommend_s: 6.0,
        part_of_community_s: 6.0,
        how_much_participated_s: 5.0,
        things_you_liked_s: %w(Great! Great!),
        things_you_would_change_s: %w(Great! Great!),
        anything_else_s: %w(Great! Great!),
        teacher_engagement: 5.0,
        overall_success: 6.0,
        facilitator_effectiveness: 5.0,
        number_teachers: 2,
        response_count: 2
      }

      bad_workshop_averages = {
        how_much_learned_s: 1.0,
        how_motivating_s: 1.0,
        how_often_talk_about_ideas_outside_s: 1.0,
        how_often_lost_track_of_time_s: 1.0,
        how_excited_before_s: 1.0,
        overall_how_interested_s: 1.0,
        more_prepared_than_before_s: 1.0,
        know_where_to_go_for_help_s: 1.0,
        suitable_for_my_experience_s: 1.0,
        would_recommend_s: 1.0,
        part_of_community_s: 1.0,
        how_much_participated_s: 1.0,
        things_you_liked_s: %w(Lousy! Lousy!),
        things_you_would_change_s: %w(Lousy! Lousy!),
        anything_else_s: %w(Lousy! Lousy!),
        teacher_engagement: 1.0,
        overall_success: 1.0,
        facilitator_effectiveness: 1.0,
        number_teachers: 2,
        response_count: 2
      }

      expected_curly_average = good_workshop_averages.merge(
        {
          how_clearly_presented_s: 5.0,
          how_interesting_s: 5.0,
          how_often_given_feedback_s: 5.0,
          how_comfortable_asking_questions_s: 5.0,
          how_often_taught_new_things_s: 5.0,
          things_facilitator_did_well_s: {'Curly' => ['Curly did everything great', 'Curly was awesome']},
          things_facilitator_could_improve_s: {'Curly' => ['Curly was perfect', 'Curly shouldnt change a thing']},
        }
      )

      expected_larry_average_good_workshop = good_workshop_averages.merge(
        {
          facilitator_effectiveness: 4.29,
          how_clearly_presented_s: 4.0,
          how_interesting_s: 4.0,
          how_often_given_feedback_s: 4.0,
          how_comfortable_asking_questions_s: 4.0,
          how_often_taught_new_things_s: 4.0,
          things_facilitator_did_well_s: {'Larry' => ['Larry did pretty good']},
          things_facilitator_could_improve_s: {'Larry' => ['Larry doesnt need to improve']},
        }
      )

      expected_larry_average_bad_workshop = bad_workshop_averages.merge(
        {
          facilitator_effectiveness: 1.0,
          how_clearly_presented_s: 1.0,
          how_interesting_s: 1.0,
          how_often_given_feedback_s: 1.0,
          how_comfortable_asking_questions_s: 1.0,
          how_often_taught_new_things_s: 1.0,
          things_facilitator_did_well_s: {'Larry' => ['Larry did not do great', 'Larry did not do great']},
          things_facilitator_could_improve_s: {'Larry' => ['Larry was awful', 'Larry was awful']},
        }
      )

      expected_larry_average_both_workshops = {
        how_much_learned_s: 3.0,
        how_motivating_s: 3.0,
        how_clearly_presented_s: 2.0,
        how_interesting_s: 2.0,
        how_often_given_feedback_s: 2.0,
        how_comfortable_asking_questions_s: 2.0,
        how_often_taught_new_things_s: 2.0,
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
        teacher_engagement: 3.0,
        overall_success: 3.5,
        facilitator_effectiveness: 2.29,
        number_teachers: 4,
        response_count: 4
      }

      @pegasus_db_stub.stubs(:where).returns(good_workshop_responses, good_workshop_responses)

      curly_filter = generate_summary_report(workshop: good_workshop, workshops: [good_workshop], course: good_workshop.course, facilitator_name: 'Curly')

      assert_equal expected_curly_average, curly_filter[:this_workshop]
      assert_equal expected_curly_average.delete_if {|k, _| FREE_RESPONSE_QUESTIONS.include? k}, curly_filter[:all_my_workshops_for_course]
      assert_equal Hash.new, curly_filter[:all_workshops_for_course]

      @pegasus_db_stub.stubs(:where).returns(good_workshop_responses, good_workshop_responses + bad_workshop_responses)
      larry_filter = generate_summary_report(workshop: good_workshop, workshops: workshops, course: good_workshop.course, facilitator_name: 'Larry')

      assert_equal expected_larry_average_good_workshop, larry_filter[:this_workshop]
      assert_equal expected_larry_average_both_workshops.delete_if {|k, _| FREE_RESPONSE_QUESTIONS.include? k}, larry_filter[:all_my_workshops_for_course]
      assert_equal Hash.new, larry_filter[:all_workshops_for_course]

      @pegasus_db_stub.stubs(:where).returns(bad_workshop_responses, good_workshop_responses + bad_workshop_responses)
      larry_filter = generate_summary_report(workshop: bad_workshop, workshops: workshops, course: good_workshop.course, facilitator_name: 'Larry')

      assert_equal expected_larry_average_bad_workshop.sort, larry_filter[:this_workshop].sort
      assert_equal expected_larry_average_both_workshops.delete_if {|k, _| FREE_RESPONSE_QUESTIONS.include? k}, larry_filter[:all_my_workshops_for_course]
      assert_equal Hash.new, larry_filter[:all_workshops_for_course]

      @pegasus_db_stub.stubs(:where).returns(
        good_workshop_responses + bad_workshop_responses,
        good_workshop_responses,
        good_workshop_responses + bad_workshop_responses,
        bad_workshop_responses
      )

      organizer_view = generate_summary_report(workshops: workshops, course: good_workshop.course, facilitator_breakdown: true)
      assert_equal(
        {
          how_much_learned_s: 3.0,
          how_motivating_s: 3.0,
          how_clearly_presented_s: 2.57,
          how_interesting_s: 2.57,
          how_often_given_feedback_s: 2.57,
          how_comfortable_asking_questions_s: 2.57,
          how_often_taught_new_things_s: 2.57,
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
          teacher_engagement: 3.0,
          overall_success: 3.5,
          facilitator_effectiveness: 2.69,
          number_teachers: 4,
          response_count: 4
        }, organizer_view[:all_my_workshops_for_course]
      )

      assert_equal({}, organizer_view[:all_workshops_for_course])
      assert_equal(expected_curly_average.delete_if {|k, _| FREE_RESPONSE_QUESTIONS.include? k}, organizer_view['Curly'])
      assert_equal(expected_larry_average_both_workshops.delete_if {|k, _| FREE_RESPONSE_QUESTIONS.include? k}, organizer_view['Larry'])
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
        how_clearly_presented_s: {'Curly' => 0, 'Larry' => 0, 'Moe' => 0},
        how_interesting_s: {'Curly' => 0, 'Larry' => 0, 'Moe' => 0},
        how_often_given_feedback_s: {'Curly' => 0, 'Larry' => 0, 'Moe' => 0},
        how_comfortable_asking_questions_s: {'Curly' => 0, 'Larry' => 0, 'Moe' => 0},
        how_often_taught_new_things_s: {'Curly' => 0, 'Larry' => 0, 'Moe' => 0},
      }, expected_free_response_summary, {
        things_facilitator_did_well_s: {'Curly' => [], 'Larry' => [], 'Moe' => []},
        things_facilitator_could_improve_s: {'Curly' => [], 'Larry' => [], 'Moe' => []}
      }], initialize_response_summaries(TEST_FACILITATORS)

      assert_equal [expected_response_summary, {
        how_clearly_presented_s: {'Curly' => 0},
        how_interesting_s: {'Curly' => 0},
        how_often_given_feedback_s: {'Curly' => 0},
        how_comfortable_asking_questions_s: {'Curly' => 0},
        how_often_taught_new_things_s: {'Curly' => 0},
      }, expected_free_response_summary, {
        things_facilitator_did_well_s: {'Curly' => []},
        things_facilitator_could_improve_s: {'Curly' => []}
      }], initialize_response_summaries(TEST_FACILITATORS, 'Curly')
    end

    test 'Generating sums without facilitator filter with extra component checking' do
      response_sums, facilitator_specific_response_sums, free_response_summary, facilitator_specific_free_response_sums = initialize_response_summaries(TEST_FACILITATORS)
      responses = [JSON.parse(@happy_teacher_response[:data]), JSON.parse(@angry_teacher_response[:data])]

      responses_per_facilitator = calculate_facilitator_name_frequencies(responses)

      generate_survey_response_sums(responses, response_sums, facilitator_specific_response_sums, nil)
      generate_free_response_sums(responses, free_response_summary, facilitator_specific_free_response_sums, responses_per_facilitator, nil)

      assert_equal(
        {
          'Curly' => 2,
          'Larry' => 2,
          'Moe' => 2,
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
          how_clearly_presented_s: {'Curly' => 6, 'Larry' => 6, 'Moe' => 6},
          how_interesting_s: {'Curly' => 6, 'Larry' => 6, 'Moe' => 6},
          how_often_given_feedback_s: {'Curly' => 6, 'Larry' => 6, 'Moe' => 6},
          how_comfortable_asking_questions_s: {'Curly' => 6, 'Larry' => 6, 'Moe' => 6},
          how_often_taught_new_things_s: {'Curly' => 6, 'Larry' => 6, 'Moe' => 6},
        }, facilitator_specific_response_sums
      )

      assert_equal(
        {
          things_facilitator_did_well_s: {'Curly' => %w(Great! Lousy!), 'Larry' => %w(Great! Lousy!), 'Moe' => %w(Great! Lousy!)},
          things_facilitator_could_improve_s: {'Curly' => %w(Great! Lousy!), 'Larry' => %w(Great! Lousy!), 'Moe' => %w(Great! Lousy!)},
          things_you_liked_s: %w(Great! Lousy!),
          things_you_would_change_s: %w(Great! Lousy!),
          anything_else_s: %w(Great! Lousy!)
        }, free_response_summary
      )

      assert_equal(
        {
          things_facilitator_did_well_s: {'Curly' => %w(Great! Lousy!), 'Larry' => %w(Great! Lousy!), 'Moe' => %w(Great! Lousy!)},
          things_facilitator_could_improve_s: {'Curly' => %w(Great! Lousy!), 'Larry' => %w(Great! Lousy!), 'Moe' => %w(Great! Lousy!)}
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
          things_facilitator_did_well_s: {'Curly' => %w(Great! Lousy!), 'Larry' => %w(Great! Lousy!), 'Moe' => %w(Great! Lousy!)},
          things_facilitator_could_improve_s: {'Curly' => %w(Great! Lousy!), 'Larry' => %w(Great! Lousy!), 'Moe' => %w(Great! Lousy!)},
          things_you_liked_s: %w(Great! Lousy!),
          things_you_would_change_s: %w(Great! Lousy!),
          anything_else_s: %w(Great! Lousy!)
        }, response_summary
      )
    end

    test 'Generating averages with facilitator filter' do
      @pegasus_db_stub.stubs(:where).returns([@happy_teacher_response, @angry_teacher_response])
      response_summary = get_score_for_workshops(workshops: @workshops, include_free_responses: true, facilitator_name_filter: 'Curly')

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
          things_facilitator_did_well_s: {'Curly' => %w(Great! Lousy!)},
          things_facilitator_could_improve_s: {'Curly' => %w(Great! Lousy!)},
          things_you_liked_s: %w(Great! Lousy!),
          things_you_would_change_s: %w(Great! Lousy!),
          anything_else_s: %w(Great! Lousy!),
          teacher_engagement: 3.0,
          overall_success: 3.5,
          facilitator_effectiveness: 3.0,
          number_teachers: 2,
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
      response_summary = get_score_for_workshops(workshops: @workshops, include_free_responses: true, facilitator_name_filter: 'Curly')

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
          number_teachers: 2,
          response_count: 2
        }, response_summary
      )
    end

    test 'rejections are filtered out when doing aggregation' do
      @pegasus_db_stub.stubs(:where).returns([@happy_teacher_response, @declined_response])
      response_summary = get_score_for_workshops(workshops: @workshops, include_free_responses: true, facilitator_name_filter: nil)

      assert_equal 5.0, response_summary[:how_much_learned_s]
      assert_equal 1, response_summary[:response_count]
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
