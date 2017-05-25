require 'test_helper'

module Api::V1::Pd
  class WorkshopScoreSummarizerTest < ActiveSupport::TestCase
    include WorkshopScoreSummarizer

    TEST_FACILITATORS = ["Tom", "Dick", "Harry"]

    # these questions are not required by the score summarizer, but are required
    # by the WorkshopSurvey form; add them to each created form just so we can
    # pass validation
    MISC_QUESTIONS = {
      gender: "Male",
      race: "White",
      age: "21 - 25",
      years_taught: "1",
      grades_taught: ["pre-K"],
      grades_planning_to_teach: ["pre-K"],
      subjects_taught: ["Science"],
      will_teach: "Yes",
      reason_for_attending: "Personal interest",
      how_heard: "Email from Code.org",
      received_clear_communication: "Strongly Agree",
      venue_feedback: "",
      school_has_tech: "Yes",
      best_pd_ever: "Strongly Agree",
      willing_to_talk: "No",
    }

    setup do
      # One teacher loved the workshop - they gave the best possible answer to
      # each question
      happy_teacher_question_responses = {}

      [
        WorkshopScoreSummarizer::FACILITATOR_EFFECTIVENESS_QUESTIONS,
        WorkshopScoreSummarizer::TEACHER_ENGAGEMENT_QUESTIONS,
        FREE_RESPONSE_QUESTIONS
      ].flatten.each do |question|
        happy_teacher_question_responses[question] = get_best_response_for_question(question, Pd::WorkshopSurvey.options)
      end

      OVERALL_SUCCESS_QUESTIONS.each do |question|
        happy_teacher_question_responses[question] = Pd::WorkshopSurvey::STRONGLY_DISAGREE_TO_STRONGLY_AGREE.last
      end

      happy_teacher_question_responses[:who_facilitated] = TEST_FACILITATORS
      WorkshopScoreSummarizer::FACILITATOR_SPECIFIC_QUESTIONS.each do |question|
        happy_teacher_question_responses[question] = {}
        TEST_FACILITATORS.each do |facilitator|
          happy_teacher_question_responses[question][facilitator] = get_best_response_for_question(question, Pd::WorkshopSurvey.options)
        end
      end

      # Another teacher hated the workshop - they gave the worst possible answer
      # to each question
      angry_teacher_question_responses = {}
      [
        WorkshopScoreSummarizer::FACILITATOR_EFFECTIVENESS_QUESTIONS,
        WorkshopScoreSummarizer::TEACHER_ENGAGEMENT_QUESTIONS,
        FREE_RESPONSE_QUESTIONS
      ].flatten.each do |question|
        angry_teacher_question_responses[question] = get_worst_response_for_question(question, Pd::WorkshopSurvey.options)
      end

      OVERALL_SUCCESS_QUESTIONS.each do |question|
        angry_teacher_question_responses[question] = Pd::WorkshopSurvey::STRONGLY_DISAGREE_TO_STRONGLY_AGREE.first
      end

      angry_teacher_question_responses[:who_facilitated] = TEST_FACILITATORS
      WorkshopScoreSummarizer::FACILITATOR_SPECIFIC_QUESTIONS.each do |question|
        angry_teacher_question_responses[question] = {}
        TEST_FACILITATORS.each do |facilitator|
          angry_teacher_question_responses[question][facilitator] = get_worst_response_for_question(question, Pd::WorkshopSurvey.options)
        end
      end

      # And baby bear was conflicted - they gave some good and some bad answers
      mixed_teacher_question_responses = {}

      WorkshopScoreSummarizer::FACILITATOR_EFFECTIVENESS_QUESTIONS.each do |question|
        mixed_teacher_question_responses[question] = get_worst_response_for_question(question, Pd::WorkshopSurvey.options)
      end
      WorkshopScoreSummarizer::TEACHER_ENGAGEMENT_QUESTIONS.each do |question|
        mixed_teacher_question_responses[question] = get_best_response_for_question(question, Pd::WorkshopSurvey.options)
      end
      FREE_RESPONSE_QUESTIONS.each do |question|
        mixed_teacher_question_responses[question] = get_worst_response_for_question(question, Pd::WorkshopSurvey.options)
      end

      OVERALL_SUCCESS_QUESTIONS.each do |question|
        mixed_teacher_question_responses[question] = Pd::WorkshopSurvey::STRONGLY_DISAGREE_TO_STRONGLY_AGREE.first
      end

      mixed_teacher_question_responses[:who_facilitated] = TEST_FACILITATORS
      WorkshopScoreSummarizer::FACILITATOR_SPECIFIC_QUESTIONS.each do |question|
        mixed_teacher_question_responses[question] = {}
        TEST_FACILITATORS.each_with_index do |facilitator, i|
          if i.even?
            mixed_teacher_question_responses[question][facilitator] = get_worst_response_for_question(question, Pd::WorkshopSurvey.options)
          else
            mixed_teacher_question_responses[question][facilitator] = get_best_response_for_question(question, Pd::WorkshopSurvey.options)
          end
        end
      end

      #@happy_teacher_response = Pd::WorkshopSurvey.new(form_data: happy_teacher_question_responses.to_json)
      #@angry_teacher_response = Pd::WorkshopSurvey.new(form_data: angry_teacher_question_responses.to_json)
      #@mixed_teacher_response = Pd::WorkshopSurvey.new(form_data: mixed_teacher_question_responses.to_json)

      facilitators = TEST_FACILITATORS.map do |facilitator_name|
        create(:facilitator, name: facilitator_name)
      end

      @happy_teacher_workshop = create(:pd_workshop, facilitators: facilitators)
      happy = Pd::WorkshopSurvey.create(
        form_data: MISC_QUESTIONS.merge(happy_teacher_question_responses).to_json,
        pd_enrollment: create(:pd_enrollment, user: create(:user), workshop: @happy_teacher_workshop)
      )
      assert_equal [], happy.errors.full_messages
      assert happy.valid?

      @angry_teacher_workshop = create(:pd_workshop, facilitators: facilitators)
      angry = Pd::WorkshopSurvey.create(
        form_data: MISC_QUESTIONS.merge(angry_teacher_question_responses).to_json,
        pd_enrollment: create(:pd_enrollment, user: create(:user), workshop: @angry_teacher_workshop)
      )
      assert_equal [], angry.errors.full_messages
      assert angry.valid?

      @mixed_teacher_workshop = create(:pd_workshop, facilitators: facilitators)
      mixed = Pd::WorkshopSurvey.create(
        form_data: MISC_QUESTIONS.merge(mixed_teacher_question_responses).to_json,
        pd_enrollment: create(:pd_enrollment, user: create(:user), workshop: @mixed_teacher_workshop)
      )
      assert_equal [], mixed.errors.full_messages
      assert mixed.valid?
    end

    test 'one happy teacher' do
      expected_results = {
        number_teachers: 1,
        response_count: 1,
        facilitator_effectiveness: 5,
        how_much_learned: 5,
        how_motivating: 5,
        how_clearly_presented: 5,
        how_interesting: 5,
        how_often_given_feedback: 5,
        how_comfortable_asking_questions: 5,
        how_often_taught_new_things: 5,
        teacher_engagement: 5,
        how_much_participated: 5,
        how_often_talk_about_ideas_outside: 5,
        how_often_lost_track_of_time: 5,
        how_excited_before: 5,
        overall_how_interested: 5,
        overall_success: 6,
        more_prepared_than_before: 6,
        know_where_to_go_for_help: 6,
        suitable_for_my_experience: 6,
        would_recommend: 6,
        part_of_community: 6,
        things_facilitator_did_well: ['(Tom) Great!', '(Dick) Great!', '(Harry) Great!'],
        things_facilitator_could_improve: ['(Tom) Great!', '(Dick) Great!', '(Harry) Great!'],
        things_you_liked: ['Great!'],
        things_you_would_change: ['Great!'],
        anything_else: ['Great!']
      }

      validate([@happy_teacher_workshop], expected_results)
    end

    test 'one angry teacher' do
      expected_results = {
        number_teachers: 1,
        response_count: 1,
        facilitator_effectiveness: 1,
        how_much_learned: 1,
        how_motivating: 1,
        how_clearly_presented: 1,
        how_interesting: 1,
        how_often_given_feedback: 1,
        how_comfortable_asking_questions: 1,
        how_often_taught_new_things: 1,
        teacher_engagement: 1,
        how_much_participated: 1,
        how_often_talk_about_ideas_outside: 1,
        how_often_lost_track_of_time: 1,
        how_excited_before: 1,
        overall_how_interested: 1,
        overall_success: 1,
        more_prepared_than_before: 1,
        know_where_to_go_for_help: 1,
        suitable_for_my_experience: 1,
        would_recommend: 1,
        part_of_community: 1,
        things_facilitator_did_well: ['(Tom) Lousy :(', '(Dick) Lousy :(', '(Harry) Lousy :('],
        things_facilitator_could_improve: ['(Tom) Lousy :(', '(Dick) Lousy :(', '(Harry) Lousy :('],
        things_you_liked: ['Lousy :('],
        things_you_would_change: ['Lousy :('],
        anything_else: ['Lousy :(']
      }

      validate([@angry_teacher_workshop], expected_results)
    end

    test 'one mixed teacher' do
      expected_results = {
        number_teachers: 1,
        response_count: 1,
        facilitator_effectiveness: 1.95,
        how_much_learned: 1,
        how_motivating: 1,
        how_clearly_presented: 2.33,
        how_interesting: 2.33,
        how_often_given_feedback: 2.33,
        how_comfortable_asking_questions: 2.33,
        how_often_taught_new_things: 2.33,
        teacher_engagement: 5,
        how_much_participated: 5,
        how_often_talk_about_ideas_outside: 5,
        how_often_lost_track_of_time: 5,
        how_excited_before: 5,
        overall_how_interested: 5,
        overall_success: 1,
        more_prepared_than_before: 1,
        know_where_to_go_for_help: 1,
        suitable_for_my_experience: 1,
        would_recommend: 1,
        part_of_community: 1,
        things_facilitator_did_well: ['(Tom) Lousy :(', '(Dick) Great!', '(Harry) Lousy :('],
        things_facilitator_could_improve: ['(Tom) Lousy :(', '(Dick) Great!', '(Harry) Lousy :('],
        things_you_liked: ['Lousy :('],
        things_you_would_change: ['Lousy :('],
        anything_else: ['Lousy :(']
      }

      expected_facilitator_results = {
        "Tom" => {
          response_count: 1,
          number_teachers: 1,
          facilitator_effectiveness: 1.0,
          how_much_learned: 1.0,
          how_motivating: 1.0,
          how_clearly_presented: 1.0,
          how_interesting: 1.0,
          how_often_given_feedback: 1.0,
          how_comfortable_asking_questions: 1.0,
          how_often_taught_new_things: 1.0,
          teacher_engagement: 5.0,
          how_much_participated: 5.0,
          how_often_talk_about_ideas_outside: 5.0,
          how_often_lost_track_of_time: 5.0,
          how_excited_before: 5.0,
          overall_how_interested: 5.0,
          overall_success: 1.0,
          more_prepared_than_before: 1.0,
          know_where_to_go_for_help: 1.0,
          suitable_for_my_experience: 1.0,
          would_recommend: 1.0,
          part_of_community: 1.0
        },
        "Dick" => {
          response_count: 1,
          number_teachers: 1,
          facilitator_effectiveness: 3.86,
          how_much_learned: 1.0,
          how_motivating: 1.0,
          how_clearly_presented: 5.0,
          how_interesting: 5.0,
          how_often_given_feedback: 5.0,
          how_comfortable_asking_questions: 5.0,
          how_often_taught_new_things: 5.0,
          teacher_engagement: 5.0,
          how_much_participated: 5.0,
          how_often_talk_about_ideas_outside: 5.0,
          how_often_lost_track_of_time: 5.0,
          how_excited_before: 5.0,
          overall_how_interested: 5.0,
          overall_success: 1.0,
          more_prepared_than_before: 1.0,
          know_where_to_go_for_help: 1.0,
          suitable_for_my_experience: 1.0,
          would_recommend: 1.0,
          part_of_community: 1.0
        },
        "Harry" => {
          response_count: 1,
          number_teachers: 1,
          facilitator_effectiveness: 1.0,
          how_much_learned: 1.0,
          how_motivating: 1.0,
          how_clearly_presented: 1.0,
          how_interesting: 1.0,
          how_often_given_feedback: 1.0,
          how_comfortable_asking_questions: 1.0,
          how_often_taught_new_things: 1.0,
          teacher_engagement: 5.0,
          how_much_participated: 5.0,
          how_often_talk_about_ideas_outside: 5.0,
          how_often_lost_track_of_time: 5.0,
          how_excited_before: 5.0,
          overall_how_interested: 5.0,
          overall_success: 1.0,
          more_prepared_than_before: 1.0,
          know_where_to_go_for_help: 1.0,
          suitable_for_my_experience: 1.0,
          would_recommend: 1.0,
          part_of_community: 1.0
        }
      }

      validate([@mixed_teacher_workshop], expected_results, expected_facilitator_results)
    end

    test 'one angry and one happy teacher' do
      expected_results = {
        number_teachers: 2,
        response_count: 2,
        facilitator_effectiveness: 3,
        how_much_learned: 3,
        how_motivating: 3,
        how_clearly_presented: 3,
        how_interesting: 3,
        how_often_given_feedback: 3,
        how_comfortable_asking_questions: 3,
        how_often_taught_new_things: 3,
        teacher_engagement: 3,
        how_much_participated: 3,
        how_often_talk_about_ideas_outside: 3,
        how_often_lost_track_of_time: 3,
        how_excited_before: 3,
        overall_how_interested: 3,
        overall_success: 3.5,
        more_prepared_than_before: 3.5,
        know_where_to_go_for_help: 3.5,
        suitable_for_my_experience: 3.5,
        would_recommend: 3.5,
        part_of_community: 3.5,
        things_facilitator_did_well: ["(Tom) Great!", "(Dick) Great!", "(Harry) Great!", "(Tom) Lousy :(", "(Dick) Lousy :(", "(Harry) Lousy :("],
        things_facilitator_could_improve: ["(Tom) Great!", "(Dick) Great!", "(Harry) Great!", "(Tom) Lousy :(", "(Dick) Lousy :(", "(Harry) Lousy :("],
        things_you_liked: ['Great!', 'Lousy :('],
        things_you_would_change: ['Great!', 'Lousy :('],
        anything_else: ['Great!', 'Lousy :(']
      }

      validate([@happy_teacher_workshop, @angry_teacher_workshop], expected_results)
    end

    private

    def validate(workshops, expected_results, expected_facilitator_results=nil)
      if expected_facilitator_results.nil?
        expected_facilitator_results = Hash.new
        TEST_FACILITATORS.each do |facilitator_name|
          expected_facilitator_results[facilitator_name] = expected_results.reject {|k, _| FREE_RESPONSE_QUESTIONS.include?(k)}
        end
      end

      actual_results, actual_facilitator_results = get_score_for_workshops(workshops, facilitator_breakdown: true, include_free_responses: true)
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
