require 'test_helper'

module Pd
  class WorkshopFacilitatorDailySurveyTest < ActiveSupport::TestCase
    include SharedWorkshopConstants

    FAKE_FORM_ID = 12345
    FAKE_SUBMISSION_ID = 67890

    self.use_transactional_test_case = true
    setup_all do
      @user = create :user
      @facilitator = create :facilitator
      @pd_summer_workshop = create :csp_summer_workshop, facilitators: [@facilitator]
      @pd_academic_year_workshop = create :csp_academic_year_workshop, facilitators: [@facilitator]
    end

    test 'response_exists? and create_placeholder!' do
      refute WorkshopFacilitatorDailySurvey.response_exists?(**existence_params(@pd_summer_workshop))

      placeholder = WorkshopFacilitatorDailySurvey.create_placeholder!(submission_id: FAKE_SUBMISSION_ID, **placeholder_params(@pd_summer_workshop))
      assert placeholder.placeholder?

      assert WorkshopFacilitatorDailySurvey.response_exists?(**existence_params(@pd_summer_workshop))
    end

    test 'duplicate?' do
      # not a duplicate
      create :pd_workshop_facilitator_daily_survey, pd_workshop: @pd_summer_workshop

      submission = build :pd_workshop_facilitator_daily_survey, params(@pd_summer_workshop)
      refute submission.duplicate?

      submission.save!

      # Same user, workshop, day, & form. New submission id
      new_submission = build :pd_workshop_facilitator_daily_survey, params(@pd_summer_workshop)
      refute submission.duplicate?
      assert new_submission.duplicate?
      refute new_submission.valid?
    end

    test 'day validity for summer workshops' do
      assert (build :pd_workshop_facilitator_daily_survey, params(@pd_summer_workshop)).valid?
      refute (build :pd_workshop_facilitator_daily_survey, params(@pd_summer_workshop).merge({day: 6})).valid?
    end

    test 'day validity for academic year workshops' do
      assert (build :pd_workshop_facilitator_daily_survey, params(@pd_academic_year_workshop)).valid?
      refute (build :pd_workshop_facilitator_daily_survey, params(@pd_academic_year_workshop).merge({day: 5})).valid?
    end

    private

    def existence_params(workshop)
      @existence_params ||= {
        user_id: @user.id,
        pd_session_id: workshop.sessions.first.id,
        facilitator_id: @facilitator.id,
        form_id: FAKE_FORM_ID
      }
    end

    def placeholder_params(workshop)
      @placeholder_params ||= existence_params(workshop).merge(day: 1)
    end

    def params(workshop)
      @params ||= placeholder_params(workshop).merge(pd_workshop_id: workshop.id)
    end
  end
end
