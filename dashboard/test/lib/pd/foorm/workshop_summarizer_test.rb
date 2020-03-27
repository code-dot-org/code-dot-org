require 'test_helper'
require 'pd/foorm/foorm_parser.rb'
require 'pd/foorm/workshop_summarizer.rb'

module Pd::Foorm
  class WorkshopSummarizerTest < ActiveSupport::TestCase
    self.use_transactional_test_case = true
    setup_all do
      daily_survey_day_0 = ::Foorm::Form.find_by_name('surveys/pd/workshop_daily_survey_day_0')
      daily_survey_day_5 = ::Foorm::Form.find_by_name('surveys/pd/workshop_daily_survey_day_5')
      @parsed_forms = FoormParser.parse_forms([daily_survey_day_0, daily_survey_day_5])
    end

    test 'summarizes survey results without error' do
      ws_submissions = Pd::WorkshopSurveyFoormSubmission.where(pd_workshop_id: 1)
      submission_ids = ws_submissions.pluck(:foorm_submission_id)
      foorm_submissions = ::Foorm::Submission.find(submission_ids)
      WorkshopSummarizer.summarize_answers_by_survey(foorm_submissions, @parsed_forms, ws_submissions)
    end
  end
end
