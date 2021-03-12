require 'test_helper'

module Pd::Foorm
  class WorkshopSummarizerTest < ActiveSupport::TestCase
    self.use_transactional_test_case = true
    setup_all do
      @daily_survey_day_0 = create :foorm_form_summer_pre_survey
      @daily_survey_day_5 = create :foorm_form_summer_post_survey
      @csf_intro_post_survey = create :foorm_form_csf_intro_post_survey
      @parsed_forms = FoormParser.parse_forms([@daily_survey_day_0, @daily_survey_day_5])
    end

    teardown_all do
      @daily_survey_day_0.delete
      @daily_survey_day_5.delete
      @csf_intro_post_survey.delete
    end

    test 'summarizes survey results without error' do
      workshop = create :csp_summer_workshop
      create :day_0_workshop_foorm_submission, :answers_low, pd_workshop_id: workshop.id
      create :day_0_workshop_foorm_submission, :answers_high, pd_workshop_id: workshop.id
      ws_submissions = Pd::WorkshopSurveyFoormSubmission.where(pd_workshop_id: workshop.id)
      submission_ids = ws_submissions.pluck(:foorm_submission_id)
      foorm_submissions = ::Foorm::Submission.find(submission_ids)
      summarized_answers = WorkshopSummarizer.summarize_answers_by_survey(
        foorm_submissions,
        @parsed_forms,
        ws_submissions
      )

      expected_result = {
        'Pre Workshop': {
          general: {
            response_count: 2,
            'surveys/pd/summer_workshop_pre_survey_test.0': {
              course_length_weeks: {
                '5_fewer': 1,
                '30_more': 1
              },
              teaching_cs_matrix: {
                committed_to_teaching_cs: {
                  '1': 1,
                  '7': 1
                },
                like_teaching_cs: {
                  '1': 1,
                  '7': 1
                },
                understand_cs: {
                  '1': 1,
                  '7': 1
                },
                skills_cs: {
                  '1': 1,
                  '7': 1
                }
              },
              expertise_rating: {
                1 => 1,
                5 => 1
              },
              birth_year: %w(1990 1983),
              racial_ethnic_identity: {
                num_respondents: 2,
                black_aa: 2,
                white: 1,
                hispanic_latino: 1
              }
            }
          }
        }
      }

      assert_equal expected_result.with_indifferent_access, summarized_answers.with_indifferent_access
    end

    test 'summarizes facilitator results' do
      workshop = create :csf_101_workshop
      facilitator = create :facilitator
      create :csf_intro_post_facilitator_workshop_submission,
        :answers_low,
        pd_workshop_id: workshop.id,
        facilitator_id: facilitator.id
      create :csf_intro_post_facilitator_workshop_submission,
        :answers_high,
        pd_workshop_id: workshop.id,
        facilitator_id: facilitator.id

      ws_submissions = Pd::WorkshopSurveyFoormSubmission.where(pd_workshop_id: workshop.id)
      submission_ids = ws_submissions.pluck(:foorm_submission_id)
      foorm_submissions = ::Foorm::Submission.find(submission_ids)
      parsed_form = FoormParser.parse_forms([@csf_intro_post_survey])
      summarized_answers = WorkshopSummarizer.summarize_answers_by_survey(
        foorm_submissions,
        parsed_form,
        ws_submissions
      ).with_indifferent_access

      facilitator_answers = summarized_answers['Post Workshop'.to_s][:facilitator]['surveys/pd/workshop_csf_intro_post_test.0']
      assert_not_empty facilitator_answers
      expected_matrix_data = {
        demonstrated_knowledge: {"7": 1, "1": 1},
        built_equitable: {"7": 1, "1": 1},
        on_track: {"7": 1, "1": 1},
        productive_discussions: {"7": 1, "1": 1},
        ways_equitable: {"7": 1, "1": 1},
        healthy_relationship: {"7": 1, "1": 1}
      }.with_indifferent_access

      assert_equal expected_matrix_data, facilitator_answers[:facilitator_effectiveness][facilitator.id]
    end

    test 'summarizes facilitator results for multiple facilitators' do
      workshop = create :csf_101_workshop
      facilitator1 = create :facilitator
      facilitator2 = create :facilitator
      create :csf_intro_post_facilitator_workshop_submission,
        :answers_high,
        pd_workshop_id: workshop.id,
        facilitator_id: facilitator1.id
      create_list :csf_intro_post_facilitator_workshop_submission,
        3,
        :answers_low,
        pd_workshop_id: workshop.id,
        facilitator_id: facilitator2.id

      ws_submissions = Pd::WorkshopSurveyFoormSubmission.where(pd_workshop_id: workshop.id)
      submission_ids = ws_submissions.pluck(:foorm_submission_id)
      foorm_submissions = ::Foorm::Submission.find(submission_ids)
      parsed_form = FoormParser.parse_forms([@csf_intro_post_survey])
      summarized_answers = WorkshopSummarizer.summarize_answers_by_survey(
        foorm_submissions,
        parsed_form,
        ws_submissions
      ).with_indifferent_access

      expected_matrix_data_high = {
        demonstrated_knowledge: {"7": 1},
        built_equitable: {"7": 1},
        on_track: {"7": 1},
        productive_discussions: {"7": 1},
        ways_equitable: {"7": 1},
        healthy_relationship: {"7": 1}
      }.with_indifferent_access

      expected_matrix_data_low = {
        demonstrated_knowledge: {"1": 3},
        built_equitable: {"1": 3},
        on_track: {"1": 3},
        productive_discussions: {"1": 3},
        ways_equitable: {"1": 3},
        healthy_relationship: {"1": 3}
      }.with_indifferent_access

      facilitator_answers = summarized_answers['Post Workshop'.to_s][:facilitator]['surveys/pd/workshop_csf_intro_post_test.0']
      assert_not_empty facilitator_answers

      assert_equal expected_matrix_data_high, facilitator_answers[:facilitator_effectiveness][facilitator1.id]
      assert_equal expected_matrix_data_low, facilitator_answers[:facilitator_effectiveness][facilitator2.id]
    end
  end
end
