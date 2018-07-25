require 'test_helper'

module Pd
  class WorkshopFacilitatorDailySurveyTest < ActiveSupport::TestCase
    FAKE_FORM_ID = 12345
    FAKE_SUBMISSION_ID = 67890

    self.use_transactional_test_case = true
    setup_all do
      @user = create :user
      @pd_workshop = create :pd_workshop, num_sessions: 5
      @facilitator = create :facilitator
      @pd_workshop.facilitators << @facilitator
      @pd_session = @pd_workshop.sessions.first
    end

    test 'response_exists? and create_placeholder!' do
      refute WorkshopFacilitatorDailySurvey.response_exists?(**existence_params)

      placeholder = WorkshopFacilitatorDailySurvey.create_placeholder!(submission_id: FAKE_SUBMISSION_ID, **placeholder_params)
      assert placeholder.placeholder?

      assert WorkshopFacilitatorDailySurvey.response_exists?(**existence_params)
    end

    test 'duplicate?' do
      # not a duplicate
      create :pd_workshop_facilitator_daily_survey

      submission = build :pd_workshop_facilitator_daily_survey, params
      refute submission.duplicate?

      submission.save!

      # Same user, workshop, day, & form. New submission id
      new_submission = build :pd_workshop_facilitator_daily_survey, params
      refute submission.duplicate?
      assert new_submission.duplicate?
      refute new_submission.valid?
    end

    private

    def existence_params
      @existence_params ||= {
        user_id: @user.id,
        pd_session_id: @pd_session.id,
        facilitator_id: @facilitator.id,
        form_id: FAKE_FORM_ID
      }
    end

    def placeholder_params
      @placeholder_params ||= existence_params.merge(day: 1)
    end

    def params
      @params ||= placeholder_params.merge(pd_workshop_id: @pd_workshop.id)
    end
  end
end
