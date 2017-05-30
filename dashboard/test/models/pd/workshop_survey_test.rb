require 'test_helper'

class Pd::WorkshopSurveyTest < ActiveSupport::TestCase
  test 'required field validations' do
    survey = Pd::WorkshopSurvey.new
    survey.pd_enrollment = create :pd_enrollment, user: create(:user)

    refute survey.valid?
    assert_equal [
      "Form data is required",
    ], survey.errors.full_messages

    survey.form_data = {}.to_json
    refute survey.valid?
    assert_equal [
      "Form data gender",
      "Form data race",
      "Form data age",
      "Form data yearsTaught",
      "Form data gradesTaught",
      "Form data gradesPlanningToTeach",
      "Form data subjectsTaught",
      "Form data willTeach",
      "Form data reasonForAttending",
      "Form data howHeard",
      "Form data receivedClearCommunication",
      "Form data schoolHasTech",
      "Form data howMuchLearned",
      "Form data howMotivating",
      "Form data howMuchParticipated",
      "Form data howOftenTalkAboutIdeasOutside",
      "Form data howOftenLostTrackOfTime",
      "Form data howExcitedBefore",
      "Form data overallHowInterested",
      "Form data morePreparedThanBefore",
      "Form data knowWhereToGoForHelp",
      "Form data suitableForMyExperience",
      "Form data wouldRecommend",
      "Form data bestPdEver",
      "Form data partOfCommunity",
      "Form data willingToTalk"
    ], survey.errors.full_messages

    survey.form_data = build(:pd_workshop_survey_hash).to_json

    assert survey.valid?
  end

  test 'conditional required fields' do
    survey = Pd::WorkshopSurvey.new
    survey.pd_enrollment = create :pd_enrollment, user: create(:user)
    survey.form_data = build(:pd_workshop_survey_hash).to_json

    survey.update_form_data_hash(
      {
        "willTeach" => "No"
      }
    )

    refute survey.valid?
    assert_equal ["Form data willNotTeachExplanation"], survey.errors.full_messages
  end

  test 'facilitator required fields' do
    facilitator = create :user, name: "Facili"
    workshop = create :pd_workshop, facilitators: [facilitator]

    survey = Pd::WorkshopSurvey.new
    survey.pd_enrollment = create :pd_enrollment,
      workshop: workshop,
      user: create(:user)

    survey.form_data = build(:pd_workshop_survey_hash).to_json
    refute survey.valid?
    assert_equal ["Form data whoFacilitated"], survey.errors.full_messages
    survey.update_form_data_hash(
      {
        "whoFacilitated" => [facilitator.name]
      }
    )

    refute survey.valid?
    assert_equal [
      "Form data howClearlyPresented[Facili]",
      "Form data howInteresting[Facili]",
      "Form data howOftenGivenFeedback[Facili]",
      "Form data helpQuality[Facili]",
      "Form data howComfortableAskingQuestions[Facili]",
      "Form data howOftenTaughtNewThings[Facili]",
      "Form data thingsFacilitatorDidWell[Facili]",
      "Form data thingsFacilitatorCouldImprove[Facili]"
    ], survey.errors.full_messages
  end

  test 'first_survey_for_user is survey-type-agnostic' do
    user = create :user

    prev_survey = Pd::LocalSummerWorkshopSurvey.new
    prev_survey.pd_enrollment = create :pd_enrollment, user: user
    prev_survey.form_data = build(:pd_local_summer_workshop_survey_hash).to_json
    assert prev_survey.first_survey_for_user?
    prev_survey.save!

    survey = Pd::WorkshopSurvey.new
    survey.pd_enrollment = create :pd_enrollment, user: user
    survey.form_data = build(:pd_workshop_survey_hash).to_json
    refute survey.first_survey_for_user?
    survey.save!

    refute prev_survey.first_survey_for_user?
  end

  test 'demographics required fields' do
    user = create :user

    # make sure the user has already filled out the form
    prev_survey = Pd::WorkshopSurvey.new
    prev_survey.pd_enrollment = create :pd_enrollment, user: user
    prev_survey.form_data = build(:pd_workshop_survey_hash).to_json
    prev_survey.save!

    survey = Pd::WorkshopSurvey.new
    survey.pd_enrollment = create :pd_enrollment, user: user
    refute survey.valid?

    # none of the demographics-specific questions should be in the error
    # messages
    demographics_failures = survey.errors.full_messages &
    [
      "Form data gender",
      "Form data race",
      "Form data age",
      "Form data yearsTaught",
      "Form data gradesTaught",
      "Form data gradesPlanningToTeach",
      "Form data subjectsTaught",
    ]

    assert_equal [], demographics_failures
  end
end
