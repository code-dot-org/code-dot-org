require 'test_helper'

module Pd
  class WorkshopDailySurveyTest < ActiveSupport::TestCase
    include SharedWorkshopConstants

    FAKE_FORM_ID = 12345
    FAKE_SUBMISSION_ID = 67890

    self.use_transactional_test_case = true
    setup_all do
      @user = create :user
      @pd_summer_workshop = create :csp_summer_workshop
      @pd_academic_year_workshop = create :csp_academic_year_workshop
    end

    test 'response_exists? and create_placeholder!' do
      refute WorkshopDailySurvey.response_exists?(**placeholder_params(@pd_summer_workshop))

      placeholder = WorkshopDailySurvey.create_placeholder!(submission_id: FAKE_SUBMISSION_ID, **placeholder_params(@pd_summer_workshop))
      assert placeholder.placeholder?

      assert WorkshopDailySurvey.response_exists?(**placeholder_params(@pd_summer_workshop))
    end

    test 'duplicate?' do
      # not a duplicate
      create :pd_workshop_daily_survey, pd_workshop: @pd_summer_workshop

      submission = build :pd_workshop_daily_survey, placeholder_params(@pd_summer_workshop)
      refute submission.duplicate?

      submission.save!

      # Same user, workshop, day, & form. New submission id
      new_submission = build :pd_workshop_daily_survey, placeholder_params(@pd_summer_workshop)
      refute submission.duplicate?
      assert new_submission.duplicate?
      refute new_submission.valid?
    end

    test 'day validity for summer workshops' do
      assert (build :pd_workshop_daily_survey, placeholder_params((@pd_summer_workshop)).merge({day: 0})).valid?
      refute (build :pd_workshop_daily_survey, placeholder_params((@pd_summer_workshop)).merge({day: 6})).valid?
    end

    test 'day validity for academic year workshops' do
      assert (build :pd_workshop_daily_survey, placeholder_params((@pd_summer_workshop)).merge({day: 1})).valid?
      refute (build :pd_workshop_daily_survey, placeholder_params((@pd_summer_workshop)).merge({day: 6})).valid?
    end

    private

    def placeholder_params(workshop)
      @placeholder_params ||= {
        user_id: @user.id,
        pd_workshop_id: workshop.id,
        day: 1,
        form_id: FAKE_FORM_ID
      }
    end
  end
end
