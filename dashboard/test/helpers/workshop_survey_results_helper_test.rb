require 'test_helper'

class Pd::WorkshopSurveyResultsHelperTest < ActionView::TestCase
  include Pd::WorkshopSurveyResultsHelper

  test 'summarize summarizes teachercons as expected' do
    enrollment_1 = create :pd_enrollment
    enrollment_1.workshop.facilitators << create(:facilitator, name: 'Facilitator Bob')
    hash_1 = build :pd_teachercon_survey_hash
    hash_1[:whoFacilitated] = ['Facilitator Bob']
    hash_1[:thingsFacilitatorDidWell] = {'Facilitator Bob': 'Bob did well'}
    hash_1[:thingsFacilitatorCouldImprove] = {'Facilitator Bob': 'Bob could improve'}
    survey_1 = create :pd_teachercon_survey, pd_enrollment: enrollment_1, form_data: hash_1.to_json

    enrollment_2 = create :pd_enrollment
    enrollment_2.workshop.facilitators << create(:facilitator, name: 'Facilitator Jane')
    hash_2 = build :pd_teachercon_survey_hash
    hash_2[:personalLearningNeedsMet] = 'Strongly Disagree'
    hash_2[:venueFeedback] = 'more venue feedback'
    hash_2[:howCouldImprove] = 'so much'
    hash_2[:whoFacilitated] = ['Facilitator Jane']
    hash_2[:thingsFacilitatorDidWell] = {'Facilitator Jane': 'Jane did well'}
    hash_2[:thingsFacilitatorCouldImprove] = {'Facilitator Jane': 'Jane could improve'}
    survey_2 = create :pd_teachercon_survey, form_data: hash_2.to_json, pd_enrollment: enrollment_2

    result_hash = summarize_workshop_surveys([survey_1, survey_2], Pd::TeacherconSurvey.options)
    assert_equal 3.5, result_hash[:personal_learning_needs_met]
    assert_equal 1, result_hash[:have_ideas_about_formative]
    assert_equal ['venue feedback', 'more venue feedback'], result_hash[:venue_feedback]
    assert_equal [['Facilitator Bob'], ['Facilitator Jane']], result_hash[:who_facilitated]
    assert_equal ['Facilitator Bob: Bob did well', 'Facilitator Jane: Jane did well'], result_hash[:things_facilitator_did_well]
    assert_equal ['Facilitator Bob: Bob could improve', 'Facilitator Jane: Jane could improve'], result_hash[:things_facilitator_could_improve]
  end

  test 'get an error if summarizing a mix of workshop surveys' do
    assert_raise RuntimeError do
      summarize_workshop_surveys(
        [create(:pd_local_summer_workshop_survey), create(:pd_teachercon_survey)],
        Pd::TeacherconSurvey.options
      )
    end
  end
end
