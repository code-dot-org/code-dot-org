require 'test_helper'

module Api::V1::Pd
  class WorkshopSurveyFoormReportControllerTest < ::ActionController::TestCase
    self.use_transactional_test_case = true

    setup do
      @workshop = create :csd_summer_workshop
    end

    test 'get generic survey report correctly' do
      create :day_5_workshop_foorm_submission_low, pd_workshop_id: @workshop.id
      create_list :day_5_workshop_foorm_submission_high, 3, pd_workshop_id: @workshop.id

      get :generic_survey_report, params: {workshop_id: @workshop.id}
      assert_response :success
      response = JSON.parse(@response.body, symbolize_names: true)

      assert_equal 'CS Discoveries', response[:course_name]
      assert_not_empty response[:questions]
      assert_not_empty response[:this_workshop]
      assert_equal 4, response[:this_workshop]['Day 5'.to_sym][:general][:response_count]

      assert_not_empty response[:workshop_rollups]
      assert_equal 5.5, response[:workshop_rollups][:single_workshop][:averages][:teacher_engagement][:average]
    end

    test 'combines incomplete matrices' do
      survey_response_1 = {
        teaching_cs_matrix: {
          like_teaching_cs: "3",
          skills_cs: "1"
        }
      }.to_json
      create_survey_submission(survey_response_1)

      survey_response_2 = {
        course_length_weeks: "5_fewer",
        teaching_cs_matrix: {
          committed_to_teaching_cs: "5",
          like_teaching_cs: "3"
        }
      }.to_json
      create_survey_submission(survey_response_2)

      get :generic_survey_report, params: {workshop_id: @workshop.id}
      assert_response :success
      response = JSON.parse(@response.body)

      assert_equal 2, response['this_workshop']['Day 0']['general']['response_count']
      matrix_response = response['this_workshop']['Day 0']['general']['surveys/pd/workshop_daily_survey_day_0.0']['teaching_cs_matrix']

      assert_not_nil matrix_response['committed_to_teaching_cs']
      assert_not_nil matrix_response['like_teaching_cs']
      assert_not_nil matrix_response['skills_cs']
    end

    test 'rollup does not fail if there are no rollup responses' do
      create :day_0_workshop_foorm_submission_low, pd_workshop_id: @workshop.id
      create_list :day_0_workshop_foorm_submission_high, 5, pd_workshop_id: @workshop.id

      get :generic_survey_report, params: {workshop_id: @workshop.id}
      assert_response :success
      response = JSON.parse(@response.body)

      assert_not_empty response['workshop_rollups']['single_workshop']
      assert_equal 0, response['workshop_rollups']['single_workshop']['response_count']
      assert_nil response['workshop_rollups']['averages']
    end

    def create_survey_submission(survey_response)
      submission = Foorm::Submission.create(
        form_name: 'surveys/pd/workshop_daily_survey_day_0',
        form_version: 0,
        answers: survey_response
      )
      create :day_0_workshop_foorm_submission_low, pd_workshop_id: @workshop.id, foorm_submission_id: submission.id
    end
  end
end
