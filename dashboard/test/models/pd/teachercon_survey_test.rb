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
      "Form data givePermissionToQuote",
      "Form data instructionFocus",
      "Form data teacherResponsibility",
      "Form data teacherTime",
    ].sort, survey.errors.full_messages.sort

    survey.form_data = build(:pd_teachercon_survey_hash).to_json

    assert survey.valid?
  end

  test 'facilitator required fields' do
    facilitator = create :user, name: "Facili"
    workshop = create :workshop, facilitators: [facilitator]

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

  test 'to summary for faciliator takes specific facilitator fields' do
    facilitator_1 = create :facilitator, name: 'Facilitator Kirk'
    facilitator_2 = create :facilitator, name: 'Facilitator Picard'
    workshop = create :workshop, facilitators: [facilitator_1, facilitator_2]

    hash = build :pd_teachercon_survey_hash
    hash[:whoFacilitated] = [facilitator_1.name, facilitator_2.name]
    hash[:thingsFacilitatorDidWell] = {
      'Facilitator Kirk': 'Kirk lead the away team well',
      'Facilitator Picard': 'Picard is a great diplomat'
    }
    hash[:thingsFacilitatorCouldImprove] = {
      'Facilitator Kirk': 'Kirk talks slowly',
      'Facilitator Picard': 'He is too awesome'
    }

    survey_1 = create :pd_teachercon_survey, pd_enrollment: (create :pd_enrollment, workshop: workshop), form_data: hash.to_json

    summary_1 = survey_1.generate_summary_for_facilitator('Facilitator Kirk')
    assert_equal 'Kirk lead the away team well', summary_1[:things_facilitator_did_well]
    assert_equal 'Kirk talks slowly', summary_1[:things_facilitator_could_improve]

    summary_2 = survey_1.generate_summary_for_facilitator('Facilitator Picard')
    assert_equal 'Picard is a great diplomat', summary_2[:things_facilitator_did_well]
    assert_equal 'He is too awesome', summary_2[:things_facilitator_could_improve]
  end

  test 'required fields are optional for deleted users' do
    survey = create :pd_teachercon_survey
    survey.pd_enrollment.user = create :teacher
    survey.pd_enrollment.user.destroy!
    survey.clear_form_data
    assert survey.valid?
  end
end
