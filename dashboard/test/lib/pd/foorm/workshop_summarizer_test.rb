require 'test_helper'

module Pd::Foorm
  class WorkshopSummarizerTest < ActiveSupport::TestCase
    self.use_transactional_test_case = true
    setup_all do
      daily_survey_day_0 = ::Foorm::Form.find_by_name('surveys/pd/workshop_daily_survey_day_0')
      daily_survey_day_5 = ::Foorm::Form.find_by_name('surveys/pd/workshop_daily_survey_day_5')
      @parsed_forms = FoormParser.parse_forms([daily_survey_day_0, daily_survey_day_5])
    end

    test 'summarizes survey results without error' do
      workshop = create :csp_summer_workshop
      create :day_0_workshop_foorm_submission_low, pd_workshop_id: workshop.id
      create :day_0_workshop_foorm_submission_high, pd_workshop_id: workshop.id
      ws_submissions = Pd::WorkshopSurveyFoormSubmission.where(pd_workshop_id: workshop.id)
      submission_ids = ws_submissions.pluck(:foorm_submission_id)
      foorm_submissions = ::Foorm::Submission.find(submission_ids)
      summarized_answers = WorkshopSummarizer.summarize_answers_by_survey(foorm_submissions, @parsed_forms, ws_submissions)

      expected_result = {
        'Day 0': {
          response_count: 2,
          'surveys/pd/workshop_daily_survey_day_0.0': {
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

      assert_equal expected_result.with_indifferent_access, summarized_answers.with_indifferent_access
    end
  end
end
