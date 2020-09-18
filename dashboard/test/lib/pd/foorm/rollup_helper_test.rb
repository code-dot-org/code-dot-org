require 'test_helper'

module Pd::Foorm
  class RollupHelperTest < ActiveSupport::TestCase
    setup_all do
      @rollup_configuration = JSON.parse(File.read('test/fixtures/rollup_config.json'), symbolize_names: true)
      @daily_survey_day_0 = create :foorm_form_summer_pre_survey
      @daily_survey_day_5 = create :foorm_form_summer_post_survey
      @csf_intro_post = create :foorm_form_csf_intro_post_survey
      @parsed_forms_csd = FoormParser.parse_forms([@daily_survey_day_0, @daily_survey_day_5])
    end

    teardown_all do
      @daily_survey_day_0.delete
      @daily_survey_day_5.delete
      @csf_intro_post.delete
    end

    test 'creates question details for CSD rollup' do
      questions_to_summarize = @rollup_configuration['CS Discoveries'.to_sym]
      question_details = RollupHelper.get_question_details_for_rollup(@parsed_forms_csd, questions_to_summarize)

      expected_question_details = {
        general: {
          expertise_rating: {
            title: "Lead Learner. 1. model expertise in how to learn  --- 5. need deep content expertise",
            type: "scale",
            form_keys: %w(surveys/pd/summer_workshop_pre_survey_test.0 surveys/pd/summer_workshop_post_survey_test.0),
            column_count: 5
          },
          teacher_engagement: {
            title: "How much do you agree or disagree with the following statements about your level of engagement in the workshop?",
            type: "matrix",
            form_keys: ["surveys/pd/summer_workshop_post_survey_test.0"],
            rows: {
              activities_engaging:  "I found the activities we did in this workshop interesting and engaging.",
              participated: "I was highly active and participated a lot in the workshop activities.",
              frequently_talk_about: "When I'm not in Code.org workshops, I frequently talk about ideas or content from the workshop with others.",
              planning_to_use: "I am definitely planning to make use of ideas and content covered in this workshop in my classroom."
            },
            column_count: 7,
            header: "Teacher Engagement",
          },
          overall_success: {
            title: "How much do you agree or disagree with the following statements about the workshop overall?",
            type: "matrix",
            form_keys: ["surveys/pd/summer_workshop_post_survey_test.0"],
            rows: {
              more_prepared: "I am more prepared to teach the material covered in this workshop than before I came.",
              know_help: "I know where to go if I need help preparing to teach this material.",
              pd_suitable_experience: "This professional development was suitable for my level of experience with teaching CS.",
              connected_community: "I feel connected to a community of computer science teachers.",
              would_recommend: "I would recommend this professional development to others.",
              absolute_best_pd: "This was the the absolute best professional development I have ever participated in."
            },
            column_count: 7,
            header: "Overall Success"
          },
        }
      }

      assert_equal expected_question_details.with_indifferent_access, question_details.with_indifferent_access
    end

    test 'creates question details for both general and facilitator questions' do
      questions_to_summarize = @rollup_configuration['CS Fundamentals'.to_sym]
      csf_forms = FoormParser.parse_forms([@csf_intro_post])
      question_details = RollupHelper.get_question_details_for_rollup(csf_forms, questions_to_summarize)
      expected_facilitator_question = {
        facilitator_effectiveness: {
          title: "During my workshop, my facilitator did the following:",
          rows: {
            demonstrated_knowledge: "Demonstrated knowledge of the curriculum.",
            built_equitable: "Built and sustained an equitable learning environment in our workshop.",
            on_track: "Kept the workshop and participants on track.",
            productive_discussions: "Supported productive workshop discussions.",
            ways_equitable: "Helped me see ways to create and support an equitable learning environment for my students.",
            healthy_relationship: "Demonstrated a healthy working relationship with their co-facilitator (if applicable)."
          },
          column_count: 7,
          type: "matrix",
          header: "Facilitator Effectiveness",
          form_keys: ["surveys/pd/workshop_csf_intro_post_test.0"]
        }
      }

      assert_not_empty question_details[:general]
      assert_not_empty question_details[:facilitator]
      assert_equal expected_facilitator_question.with_indifferent_access, question_details.with_indifferent_access[:facilitator]
    end

    test 'ignores inconsistent questions' do
      # inconsistent form has different scale for expertise_rating, so that question should be ignored
      inconsistent_form = create :foorm_form_with_inconsistent_questions
      @parsed_forms = FoormParser.parse_forms([@daily_survey_day_0, @daily_survey_day_5, inconsistent_form])
      question_details = RollupHelper.get_question_details_for_rollup(
        @parsed_forms,
        @rollup_configuration['CS Discoveries'.to_sym]
      )

      assert_nil question_details[:expertise_rating]
    end
  end
end
