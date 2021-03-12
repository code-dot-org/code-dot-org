require 'test_helper'

module Pd
  class WorkshopSurveyFoormSubmissionTest < ActiveSupport::TestCase
    self.use_transactional_test_case = true
    setup_all do
      @user = create :user
      @pd_summer_workshop = create :csp_summer_workshop
      @foorm_form = create :foorm_form
    end

    test 'save workshop with submission' do
      workshop_survey = Pd::WorkshopSurveyFoormSubmission.new(user_id: @user.id, pd_workshop_id: @pd_summer_workshop.id, day: 0)
      workshop_survey.save_with_foorm_submission({'question1': 'answer1'}, @foorm_form.name, @foorm_form.version)
      assert_equal @foorm_form.name, workshop_survey.foorm_submission.form_name
    end

    test 'can check that survey has already been submitted' do
      workshop_survey = Pd::WorkshopSurveyFoormSubmission.new(user_id: @user.id, pd_workshop_id: @pd_summer_workshop.id, day: 0)
      workshop_survey.save_with_foorm_submission({'question1': 'answer1'}, @foorm_form.name, @foorm_form.version)

      assert Pd::WorkshopSurveyFoormSubmission.has_submitted_form?(@user.id, @pd_summer_workshop.id, nil, 0, @foorm_form.name)
    end

    test 'can check that survey has already been submitted without form name' do
      workshop_survey = Pd::WorkshopSurveyFoormSubmission.new(user_id: @user.id, pd_workshop_id: @pd_summer_workshop.id, day: 0)
      workshop_survey.save_with_foorm_submission({'question1': 'answer1'}, @foorm_form.name, @foorm_form.version)

      assert Pd::WorkshopSurveyFoormSubmission.has_submitted_form?(@user.id, @pd_summer_workshop.id, nil, 0, nil)
    end

    test 'can check that survey has not already been submitted' do
      refute Pd::WorkshopSurveyFoormSubmission.has_submitted_form?(@user.id, @pd_summer_workshop.id, nil, nil, @foorm_form.name)
    end

    test 'do not allow a day 6 survey for a 5 day workshop' do
      workshop_survey = Pd::WorkshopSurveyFoormSubmission.new(user_id: @user.id, pd_workshop_id: @pd_summer_workshop.id, day: 6)
      assert_raises(ActiveRecord::RecordInvalid) do
        workshop_survey.save_with_foorm_submission({'question1': 'answer1'}, @foorm_form.name, @foorm_form.version)
      end
    end

    test 'allow a day 6 survey for a 6 day workshop' do
      long_summer_workshop = create :csp_summer_workshop, num_sessions: 6
      workshop_survey = Pd::WorkshopSurveyFoormSubmission.new(
        user_id: @user.id,
        pd_workshop_id: long_summer_workshop.id,
        day: 6
      )
      workshop_survey.save_with_foorm_submission(
        {'question1': 'answer1'},
        @foorm_form.name,
        @foorm_form.version
      )
      assert Pd::WorkshopSurveyFoormSubmission.has_submitted_form?(
        @user.id,
        long_summer_workshop.id,
        nil,
        6,
        nil
      )
    end

    test 'facilitator_specific? returns true if submission is facilitator specific' do
      facilitator_form_submission_metadata = create :csf_intro_post_facilitator_workshop_submission, :answers_low
      assert facilitator_form_submission_metadata.facilitator_specific?
    end

    test 'facilitator_specific? returns false if submission is not facilitator specific' do
      facilitator_form_submission_metadata = create :csf_intro_post_workshop_submission, :answers_low
      refute facilitator_form_submission_metadata.facilitator_specific?
    end
  end
end
