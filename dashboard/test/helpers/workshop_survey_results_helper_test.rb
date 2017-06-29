require 'test_helper'

class Pd::WorkshopSurveyResultsHelperTest < ActionView::TestCase
  include Pd::WorkshopSurveyResultsHelper

  test 'summarize summarizes teachercons as expected' do
    enrollment = create :pd_enrollment
    enrollment.workshop.facilitators << create(:faciliator, name: 'Facilitator Bob')
    survey_1 = create :pd_teachercon_survey
    hash_2 = build :pd_teachercon_survey_hash
    hash_2[:personalLearningNeedsMet] = 'Strongly Disagree'
    hash_2[:venueFeedback] = 'more venue feedback'
    hash_2[:howCouldImprove] = 'so much'
    survey_2 = create :pd_teachercon_survey, form_data: hash_2.to_json

    result_hash = summarize_workshop_surveys([survey_1, survey_2], Pd::TeacherconSurvey.options)
    assert_equal 3.5, result_hash[:personal_learning_needs_met]
    assert_equal 1, result_hash[:have_ideas_about_formative]
    assert_equal ['venue feedback', 'more venue feedback'], result_hash[:venue_feedback]
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
