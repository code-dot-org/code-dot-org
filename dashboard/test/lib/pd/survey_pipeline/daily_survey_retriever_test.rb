require 'test_helper'
require 'pd/survey_pipeline/daily_survey_retriever.rb'

module Pd::SurveyPipeline
  class DailySurveyRetrieverTest < ActiveSupport::TestCase
    include Pd::WorkshopConstants

    self.use_transactional_test_case = true

    setup_all do
      @workshop_form_ids = [11_000_000_000_000, 11_000_000_000_001]
      @facilitator_form_ids = [22_000_000_000_000, 22_000_000_000_001]
      @workshops = create_list :csf_deep_dive_workshop, 2, num_sessions: 2

      teachers = create_list :teacher, 2
      facilitators = create_list :facilitator, 2
      days = [0, 1]

      # Create workshop daily survey submissions
      # 2 workshops * 2 teachers * 2 days * 2 forms = 16 submissions
      ws_combinations = @workshops.product(teachers, days, @workshop_form_ids)
      @workshop_submissions = ws_combinations.each do |ws, teacher, day, form|
        create :pd_workshop_daily_survey, pd_workshop: ws, user: teacher, day: day, form_id: form
      end

      # Create facilitator daily survey submissions
      # 2 workshops * 2 teachers * 2 days * 2 forms * 2 facilitators = 32 submissions
      f_combinations = @workshops.product(teachers, days, @facilitator_form_ids, facilitators)
      @facilitator_submissions = f_combinations.each do |ws, teacher, day, form, facilitator|
        create :pd_workshop_facilitator_daily_survey, pd_workshop: ws, user: teacher,
          day: day, form_id: form, pd_session: ws.sessions[day], facilitator: facilitator
      end

      # Create survey questions
      # 2 general workshop + 2 facilitator-specific surveys
      @survey_questions = (@workshop_form_ids + @facilitator_form_ids).each do |form|
        create :pd_survey_question, form_id: form
      end
    end

    test 'return all submissions and questions of a workshop' do
      workshop_id = @workshops.first.id
      survey_questions, ws_submissions, facilitator_submissions =
        DailySurveyRetriever.retrieve_all_workshop_surveys workshop_id

      expected_ws_submission_count = @workshop_submissions.length / @workshops.length
      assert_equal expected_ws_submission_count, ws_submissions.length
      assert_equal [workshop_id], ws_submissions.pluck(:pd_workshop_id).uniq

      expected_facilitator_submissions_count = @facilitator_submissions.length / @workshops.length
      assert_equal expected_facilitator_submissions_count, facilitator_submissions.length
      assert_equal [workshop_id], facilitator_submissions.pluck(:pd_workshop_id).uniq

      assert_equal @workshop_form_ids + @facilitator_form_ids, survey_questions.pluck(:form_id)
    end

    test 'return empty if workshop does not have submission' do
      # Use non-existence workshop id as filter
      workshop_id = @workshops.pluck(:id).max + 1
      survey_questions, ws_submissions, facilitator_submissions =
        DailySurveyRetriever.retrieve_all_workshop_surveys workshop_id

      assert_equal 0, survey_questions.length
      assert_equal 0, ws_submissions.length
      assert_equal 0, facilitator_submissions.length
    end
  end
end
