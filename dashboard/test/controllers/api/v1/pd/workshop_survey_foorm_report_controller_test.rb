require 'test_helper'

module Api::V1::Pd
  class WorkshopSurveyFoormReportControllerTest < ::ActionController::TestCase
    self.use_transactional_test_case = true

    setup do
      @workshop = create :csd_summer_workshop
    end

    test 'get generic survey report correctly' do
      create :day_5_workshop_foorm_submission, :answers_low, pd_workshop_id: @workshop.id
      create_list :day_5_workshop_foorm_submission, 3, :answers_high, pd_workshop_id: @workshop.id

      get :generic_survey_report, params: {workshop_id: @workshop.id}
      assert_response :success
      response = JSON.parse(@response.body, symbolize_names: true)

      assert_equal 'CS Discoveries', response[:course_name]
      assert_not_empty response[:questions]
      assert_not_empty response[:this_workshop]
      assert_equal 4, response[:this_workshop]['Day 5'.to_sym][:general][:response_count]

      assert_not_empty response[:workshop_rollups]
      general_rollup = response[:workshop_rollups][:general]
      assert_equal 5.5, general_rollup[:single_workshop][:averages][:teacher_engagement][:average]
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
      day_0_general_response = response['this_workshop']['Day 0']['general']

      assert_equal 2, day_0_general_response['response_count']
      matrix_response = day_0_general_response['surveys/pd/workshop_daily_survey_day_0.0']['teaching_cs_matrix']

      assert_not_nil matrix_response['committed_to_teaching_cs']
      assert_not_nil matrix_response['like_teaching_cs']
      assert_not_nil matrix_response['skills_cs']
    end

    test 'rollup does not fail if there are no rollup responses' do
      create :day_0_workshop_foorm_submission, :answers_low, pd_workshop_id: @workshop.id
      create_list :day_0_workshop_foorm_submission, 5, :answers_high, pd_workshop_id: @workshop.id

      get :generic_survey_report, params: {workshop_id: @workshop.id}
      assert_response :success
      response = JSON.parse(@response.body)

      assert_not_empty response['workshop_rollups']['general']['single_workshop']
      assert_equal 0, response['workshop_rollups']['general']['single_workshop']['response_count']
      assert_nil response['workshop_rollups']['general']['averages']
    end

    test 'successfully create rollup with facilitator data' do
      csf_workshop = create :csf_workshop,
        started_at:  Time.now.utc - 1.day,
        ended_at: Time.now.utc - 1.hour
      facilitator_id = csf_workshop.facilitators.pluck(:id).first
      create_surveys_for_csf_workshop(csf_workshop, facilitator_id, 3, 2)

      get :generic_survey_report, params: {workshop_id: csf_workshop.id}
      assert_response :success
      response = JSON.parse(@response.body, symbolize_names: true)

      assert_equal 'CS Fundamentals', response[:course_name]
      assert_not_empty response[:questions]
      assert_not_empty response[:this_workshop]
      assert_equal 5, response[:this_workshop][:Overall][:general][:response_count]

      assert_not_empty response[:workshop_rollups]
      general_rollup = response[:workshop_rollups][:general]
      facilitator_rollup = response[:workshop_rollups][:facilitator]
      assert_equal 4.6, general_rollup[:single_workshop][:averages][:teacher_engagement][:average]

      assert_equal 5, general_rollup[:overall_facilitator][facilitator_id.to_s.to_sym][:response_count]
      assert_equal 5, facilitator_rollup[:overall_facilitator][facilitator_id.to_s.to_sym][:response_count]

      first_facilitator_rollup = facilitator_rollup[:single_workshop][facilitator_id.to_s.to_sym]
      assert_equal 4.6, first_facilitator_rollup[:averages][:facilitator_effectiveness][:rows][:on_track]
      assert_equal 4.6, first_facilitator_rollup[:averages][:facilitator_effectiveness][:average]
    end

    test 'if there are no facilitator surveys still create csf rollup' do
      csf_workshop = create :csf_workshop,
        started_at:  Time.now.utc - 1.day,
        ended_at: Time.now.utc - 1.hour
      facilitator_id = csf_workshop.facilitators.pluck(:id).first
      create_list :csf_intro_post_workshop_submission, 1, :answers_low, pd_workshop_id: csf_workshop.id
      create_list :csf_intro_post_workshop_submission, 5, :answers_high, pd_workshop_id: csf_workshop.id

      get :generic_survey_report, params: {workshop_id: csf_workshop.id}
      assert_response :success
      response = JSON.parse(@response.body, symbolize_names: true)

      assert_equal 'CS Fundamentals', response[:course_name]
      assert_not_empty response[:questions]
      assert_not_empty response[:this_workshop]
      assert_equal 6, response[:this_workshop][:Overall][:general][:response_count]

      assert_not_empty response[:workshop_rollups]

      general_rollup = response[:workshop_rollups][:general]
      assert_equal 6, general_rollup[:overall_facilitator][facilitator_id.to_s.to_sym][:response_count]
    end

    test 'calculates averages across multiple workshops correctly' do
      csf_workshop_1 = create :csf_workshop,
        started_at:  Time.now.utc - 1.day,
        ended_at: Time.now.utc - 1.hour
      csf_workshop_2 = create :csf_workshop,
        started_at:  Time.now.utc - 1.day,
        ended_at: Time.now.utc - 1.hour
      create_surveys_for_csf_workshop(csf_workshop_1, csf_workshop_1.facilitators.pluck(:id).first, 3, 2)
      create_surveys_for_csf_workshop(csf_workshop_1, csf_workshop_2.facilitators.pluck(:id).first, 5, 1)

      get :generic_survey_report, params: {workshop_id: csf_workshop_1.id}
      assert_response :success
      response = JSON.parse(@response.body, symbolize_names: true)

      overall_rollup_general = response[:workshop_rollups][:general][:overall]
      assert_equal 11, overall_rollup_general[:response_count]
      assert_equal 5.36, overall_rollup_general[:averages][:teacher_engagement][:rows][:engaging]
      overall_rollup_facilitator = response[:workshop_rollups][:facilitator][:overall]
      assert_equal 11, overall_rollup_facilitator[:response_count]
      assert_equal 5.36, overall_rollup_facilitator[:averages][:facilitator_effectiveness][:rows][:demonstrated_knowledge]
      overall_facilitator_rollup_facilitator = response[:workshop_rollups][:facilitator][:overall_facilitator]
      csf_workshop_1_facilitator = csf_workshop_1.facilitators.pluck(:id).first.to_s.to_sym
      assert_equal 5, overall_facilitator_rollup_facilitator[csf_workshop_1_facilitator][:response_count]
    end

    def create_surveys_for_csf_workshop(csf_workshop, facilitator_id, high_count, low_count)
      create_list :csf_intro_post_facilitator_workshop_submission,
        low_count,
        :answers_low,
        pd_workshop_id: csf_workshop.id,
        facilitator_id: facilitator_id
      create_list :csf_intro_post_facilitator_workshop_submission,
        high_count,
        :answers_high,
        pd_workshop_id: csf_workshop.id,
        facilitator_id: facilitator_id
      create_list :csf_intro_post_workshop_submission, low_count, :answers_low, pd_workshop_id: csf_workshop.id
      create_list :csf_intro_post_workshop_submission, high_count, :answers_high, pd_workshop_id: csf_workshop.id
    end

    def create_survey_submission(survey_response)
      submission = Foorm::Submission.create(
        form_name: 'surveys/pd/workshop_daily_survey_day_0',
        form_version: 0,
        answers: survey_response
      )
      create :day_0_workshop_foorm_submission,
        pd_workshop_id: @workshop.id,
        foorm_submission_id: submission.id
    end
  end
end
