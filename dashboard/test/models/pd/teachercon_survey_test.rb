require 'test_helper'

class Pd::TeacherconSurveyTest < ActiveSupport::TestCase
  test 'required field validations' do
    survey = Pd::TeacherconSurvey.new
    survey.pd_enrollment = create :pd_enrollment, user: create(:user)

    refute survey.valid?
    assert_equal [
      "Form data is required",
    ], survey.errors.full_messages

    survey.form_data = {}.to_json
    refute survey.valid?
    assert_equal [
      "Form data personalLearningNeedsMet",
      "Form data haveIdeasAboutFormative",
      "Form data haveIdeasAboutSummative",
      "Form data haveConcreteIdeas",
      "Form data toolsWillHelp",
      "Form data learnedEnoughToMoveForward",
      "Form data feelConfidentUsingMaterials",
      "Form data feelConfidentCanHelpStudents",
      "Form data havePlan",
      "Form data feelComfortableLeading",
      "Form data haveLessAnxiety",
      "Form data whatHelpedMost",
      "Form data whatDetracted",
      "Form data venueFeedback",
      "Form data receivedClearCommunication",
      "Form data knowWhereToGoForHelp",
      "Form data suitableForMyExperience",
      "Form data practicingTeachingHelped",
      "Form data seeingOthersTeachHelped",
      "Form data facilitatorsPresentedInformationClearly",
      "Form data facilitatorsProvidedFeedback",
      "Form data feltComfortableAskingQuestions",
      "Form data morePreparedThanBefore",
      "Form data lookForwardToContinuing",
      "Form data allStudentsShouldTake",
      "Form data wouldRecommend",
      "Form data bestPdEver",
      "Form data partOfCommunity",
      "Form data howMuchParticipated",
      "Form data howOftenLostTrackOfTime",
      "Form data howExcitedBefore",
      "Form data howHappyAfter",
      "Form data facilitatorsDidWell",
      "Form data facilitatorsCouldImprove",
      "Form data likedMost",
      "Form data wouldChange",
      "Form data givePermissionToQuote"
    ], survey.errors.full_messages

    survey.form_data = build(:pd_teachercon_survey_hash).to_json

    assert survey.valid?
  end

  test 'facilitator required fields' do
    facilitator = create :user, name: "Facili"
    workshop = create :pd_workshop, facilitators: [facilitator]

    survey = Pd::TeacherconSurvey.new
    survey.pd_enrollment = create :pd_enrollment,
      workshop: workshop,
      user: create(:user)

    survey.form_data = build(:pd_teachercon_survey_hash).to_json
    refute survey.valid?
    assert_equal ["Form data whoFacilitated"], survey.errors.full_messages
    survey.update_form_data_hash(
      {
        "whoFacilitated" => [facilitator.name]
      }
    )

    refute survey.valid?
    assert_equal [
      "Form data thingsFacilitatorDidWell[Facili]",
      "Form data thingsFacilitatorCouldImprove[Facili]"
    ], survey.errors.full_messages
  end

  test 'conditional required fields' do
    survey = Pd::TeacherconSurvey.new
    survey.pd_enrollment = create :pd_enrollment, user: create(:user)
    survey.form_data = build(:pd_teachercon_survey_hash).to_json

    survey.update_form_data_hash(
      {
        "personalLearningNeedsMet" => "Disagree"
      }
    )

    refute survey.valid?
    assert_equal ["Form data howCouldImprove"], survey.errors.full_messages
  end
end
