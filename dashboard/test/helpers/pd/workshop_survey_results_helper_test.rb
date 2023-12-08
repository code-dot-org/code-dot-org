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
    create :pd_teachercon_survey, pd_enrollment: enrollment_1, form_data: hash_1.to_json

    enrollment_2 = create :pd_enrollment
    enrollment_2.workshop.facilitators << create(:facilitator, name: 'Facilitator Jane')
    hash_2 = build :pd_teachercon_survey_hash
    hash_2[:receivedClearCommunication] = 'Strongly Disagree'
    hash_2[:venueFeedback] = 'more venue feedback'
    hash_2[:howCouldImprove] = 'so much'
    hash_2[:whoFacilitated] = ['Facilitator Jane']
    hash_2[:thingsFacilitatorDidWell] = {'Facilitator Jane': 'Jane did well'}
    hash_2[:thingsFacilitatorCouldImprove] = {'Facilitator Jane': 'Jane could improve'}
    create :pd_teachercon_survey, form_data: hash_2.to_json, pd_enrollment: enrollment_2
    workshops = [enrollment_1.workshop, enrollment_2.workshop]
    workshops.each {|w| w.update(course: Pd::Workshop::COURSE_CSP, subject: Pd::Workshop::SUBJECT_CSP_TEACHER_CON)}

    result_hash = summarize_workshop_surveys(workshops: workshops)
    assert_equal 3.5, result_hash[:received_clear_communication]
    assert_equal 2, result_hash[:part_of_community]
    assert_equal ['venue feedback', 'more venue feedback'], result_hash[:venue_feedback]

    assert_equal({'Facilitator Bob' => ['Bob did well'], 'Facilitator Jane' => ['Jane did well']}, result_hash[:things_facilitator_did_well])
    assert_equal({'Facilitator Bob' => ['Bob could improve'], 'Facilitator Jane' => ['Jane could improve']}, result_hash[:things_facilitator_could_improve])

    # When viewing workshop surveys for just Facilitator Bob, expect to only see bob's feedback
    result_hash = summarize_workshop_surveys(workshops: workshops, facilitator_name_filter: 'Facilitator Bob')
    assert_equal ['Bob did well'], result_hash[:things_facilitator_did_well]
    assert_equal ['Bob could improve'], result_hash[:things_facilitator_could_improve]
  end

  test 'averaging across multiple surveys' do
    workshop_1 = create :summer_workshop, num_sessions: 1, num_facilitators: 2, num_completed_surveys: 5
    workshop_2 = create :summer_workshop, num_sessions: 1, num_facilitators: 3, num_completed_surveys: 10

    workshop_2.survey_responses.each do |response|
      response.update_form_data_hash(
        {
          how_clearly_presented: {
            workshop_2.facilitators.first.name => 'Not at all clearly',
            workshop_2.facilitators.second.name => 'Not at all clearly',
            workshop_2.facilitators.third.name => 'Not at all clearly'
          }
        }
      )
      response.save
    end

    # With 10 people saying "Not at all clearly" to 3 facilitators, and 5 people saying
    # "Extremely Clearly" to 2 facilitators, we'd expect the answer to be
    # [(10 * 3 * 1) + (5 * 2 * 5)] / (10 + 30) = 2
    result_hash = summarize_workshop_surveys(workshops: [workshop_1, workshop_2], facilitator_breakdown: false)
    assert_equal 2, result_hash[:how_clearly_presented]
  end
end
