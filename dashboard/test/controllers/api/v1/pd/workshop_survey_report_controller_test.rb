require 'test_helper'

class Api::V1::Pd::WorkshopSurveyReportControllerTest < ::ActionController::TestCase
  setup do
    @facilitator = create :facilitator
    @organizer = create :workshop_organizer
    @workshop = create(:pd_workshop, organizer: @organizer, facilitators: [@facilitator])
    AWS::S3.stubs(:download_from_bucket).returns(Hash[@workshop.course.to_sym, {}].to_json)
  end

  API = '/api/v1/pd/workshops'

  test_user_gets_response_for(
    :workshop_survey_report,
    user: :admin,
    params: -> {{workshop_id: @workshop.id}}
  )

  test 'facilitators can view their survey' do
    sign_in @facilitator
    get :workshop_survey_report, params: {workshop_id: @workshop.id}
    assert_response :success

    @controller = ::Api::V1::Pd::WorkshopSurveyReportController.new

    other_facilitator = create :facilitator
    other_workshop = create(:pd_workshop, organizer: @organizer, facilitators: [other_facilitator])
    get :workshop_survey_report, params: {workshop_id: other_workshop.id}
    assert_response :forbidden
  end

  test 'local workshop survey report for the first of two facilitators' do
    workshop_1, _ = build_sample_data
    sign_in(workshop_1.facilitators.first)
    get :local_workshop_survey_report, params: {workshop_id: workshop_1.id}
    assert_response :success
    response_hash = JSON.parse(@response.body)

    assert_equal 3, response_hash['this_workshop']['num_enrollments']
    assert_equal 6, response_hash['all_my_local_workshops']['num_surveys']
    assert_equal 3, response_hash['this_workshop']['num_enrollments']
    assert_equal 6, response_hash['all_my_local_workshops']['num_surveys']

    assert_equal 5, response_hash['this_workshop']['how_much_learned']
    assert_equal 3, response_hash['all_my_local_workshops']['how_much_learned']
    assert_equal 5, response_hash['this_workshop']['how_clearly_presented']
    assert_equal 5, response_hash['all_my_local_workshops']['how_clearly_presented']
    assert_equal Array.new(3, 'Cersei brought good wine'), response_hash['this_workshop']['things_facilitator_did_well']
    assert_equal Array.new(3, 'Cersei brought good wine'), response_hash['all_my_local_workshops']['things_facilitator_did_well']
  end

  test 'local workshop survey report for the workshop organizer' do
    _, workshop_2 = build_sample_data
    sign_in(workshop_2.organizer)

    get :local_workshop_survey_report, params: {workshop_id: workshop_2.id}
    assert_response :success
    response_hash = JSON.parse(@response.body)

    assert_equal 1, response_hash['this_workshop']['how_much_learned']
    assert_equal 3, response_hash['all_my_local_workshops']['how_much_learned']
    assert_equal({'Jaime' => 1.0}, response_hash['this_workshop']['how_clearly_presented'])
    assert_equal 3, response_hash['all_my_local_workshops']['how_clearly_presented']
    assert_equal({'Jaime' => Array.new(3, 'Jaime was very funny')}, response_hash['this_workshop']['things_facilitator_did_well'])
    assert_equal({'Cersei' => Array.new(3, 'Cersei brought good wine'), 'Jaime' => Array.new(3, 'Jaime was very funny')}, response_hash['all_my_local_workshops']['things_facilitator_did_well'])
  end

  test 'local workshop survey report for a workshop admin' do
    _, workshop_2 = build_sample_data
    admin = create :workshop_admin
    sign_in(admin)

    get :local_workshop_survey_report, params: {workshop_id: workshop_2.id}
    assert_response :success
    response_hash = JSON.parse(@response.body)

    assert_equal 1, response_hash['this_workshop']['how_much_learned']
    assert_equal({}, response_hash['all_my_local_workshops'])
    assert_equal({'Jaime' => 1.0}, response_hash['this_workshop']['how_clearly_presented'])
    assert_equal({'Jaime' => Array.new(3, 'Jaime was very funny')}, response_hash['this_workshop']['things_facilitator_did_well'])
  end

  [:student, :teacher, :facilitator, :workshop_organizer].each do |user|
    test_user_gets_response_for(
      :local_workshop_survey_report,
      response: :forbidden,
      user: user,
      params: -> {{workshop_id: @workshop.id}}
    )
  end

  test_user_gets_response_for(
    :workshop_survey_report,
    response: :forbidden,
    user: :teacher,
    params: -> {{workshop_id: @workshop.id}}
  )

  private

  def build_sample_data
    facilitator_1 = create(:facilitator, name: 'Cersei')
    facilitator_2 = create(:facilitator, name: 'Jaime')
    organizer = create :workshop_organizer
    create :workshop_admin
    workshop_1 = create(:pd_workshop, :local_summer_workshop, num_enrollments: 3, organizer: organizer)
    workshop_2 = create(:pd_workshop, :local_summer_workshop, num_enrollments: 3, organizer: organizer)
    workshop_1.facilitators << [facilitator_1, facilitator_2]
    workshop_2.facilitators << [facilitator_1, facilitator_2]

    workshop_1.enrollments.each do |enrollment|
      hash = build :pd_local_summer_workshop_survey_hash
      hash[:who_facilitated] = ['Cersei']
      hash[:how_clearly_presented] = {'Cersei': 'Extremely clearly'}
      hash[:how_interesting] = {'Cersei': 'Extremely interesting'}
      hash[:how_often_given_feedback] = {'Cersei': 'All the time'}
      hash[:help_quality] = {'Cersei': 'Extremely good'}
      hash[:how_comfortable_asking_questions] = {'Cersei': 'Extremely comfortable'}
      hash[:how_often_taught_new_things] = {'Cersei': 'All the time'}
      hash[:things_facilitator_did_well] = {'Cersei': 'Cersei brought good wine'}
      hash[:things_facilitator_could_improve] = {'Cersei': 'Cersei drank it all'}

      create :pd_local_summer_workshop_survey, form_data: hash.to_json, pd_enrollment: enrollment
    end

    workshop_2.enrollments.each do |enrollment|
      hash = build :pd_local_summer_workshop_survey_hash
      hash[:how_much_learned] = 'Almost nothing'
      hash[:who_facilitated] = ['Jaime']
      hash[:how_clearly_presented] = {'Jaime': 'Not at all clearly'}
      hash[:how_interesting] = {'Jaime': 'Extremely interesting'}
      hash[:how_often_given_feedback] = {'Jaime': 'All the time'}
      hash[:help_quality] = {'Jaime': 'Extremely good'}
      hash[:how_comfortable_asking_questions] = {'Jaime': 'Extremely comfortable'}
      hash[:how_often_taught_new_things] = {'Jaime': 'All the time'}
      hash[:things_facilitator_did_well] = {'Jaime': 'Jaime was very funny'}
      hash[:things_facilitator_could_improve] = {'Jaime': 'Jaime was rather snide'}

      create :pd_local_summer_workshop_survey, form_data: hash.to_json, pd_enrollment: enrollment
    end

    return workshop_1, workshop_2
  end
end
