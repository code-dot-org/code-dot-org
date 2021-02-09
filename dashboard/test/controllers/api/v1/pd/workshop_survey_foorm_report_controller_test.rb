require 'test_helper'

module Api::V1::Pd
  class WorkshopSurveyFoormReportControllerTest < ::ActionController::TestCase
    self.use_transactional_test_case = true

    setup_all do
      @summer_post_survey = create :foorm_form_summer_post_survey
      @summer_pre_survey = create :foorm_form_summer_pre_survey
      @csf_intro_post_survey = create :foorm_form_csf_intro_post_survey
    end

    setup do
      @workshop = create :csd_summer_workshop
      @workshop_admin = create :workshop_admin
    end

    teardown_all do
      @summer_post_survey.delete
      @summer_pre_survey.delete
      @csf_intro_post_survey.delete
    end

    test 'get generic survey report correctly' do
      sign_in @workshop_admin
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
      sign_in @workshop_admin
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
      day_0_general_response = response['this_workshop']['Pre Workshop']['general']

      assert_equal 2, day_0_general_response['response_count']
      matrix_response = day_0_general_response['surveys/pd/summer_workshop_pre_survey_test.0']['teaching_cs_matrix']

      assert_not_nil matrix_response['committed_to_teaching_cs']
      assert_not_nil matrix_response['like_teaching_cs']
      assert_not_nil matrix_response['skills_cs']
    end

    test 'rollup does not fail if there are no rollup responses' do
      sign_in @workshop_admin
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
      sign_in @workshop_admin
      csf_workshop = create :csf_workshop,
        started_at:  Time.now.utc - 1.day,
        ended_at: Time.now.utc - 1.hour
      facilitator_ids = csf_workshop.facilitators.pluck(:id)
      create_surveys_for_csf_workshop(csf_workshop, facilitator_ids, 3, 2)
      facilitator_id = facilitator_ids[0]

      get :generic_survey_report, params: {workshop_id: csf_workshop.id}
      assert_response :success
      response = JSON.parse(@response.body).with_indifferent_access

      assert_equal 'CS Fundamentals', response[:course_name]
      assert_not_empty response[:questions]
      assert_not_empty response[:this_workshop]
      assert_equal 5, response[:this_workshop]['Post Workshop'][:general][:response_count]

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
      sign_in @workshop_admin
      csf_workshop = create :csf_workshop,
        started_at:  Time.now.utc - 1.day,
        ended_at: Time.now.utc - 1.hour
      facilitator_id = csf_workshop.facilitators.pluck(:id).first
      create_list :csf_intro_post_workshop_submission, 1, :answers_low, pd_workshop_id: csf_workshop.id
      create_list :csf_intro_post_workshop_submission, 5, :answers_high, pd_workshop_id: csf_workshop.id

      get :generic_survey_report, params: {workshop_id: csf_workshop.id}
      assert_response :success
      response = JSON.parse(@response.body).with_indifferent_access

      assert_equal 'CS Fundamentals', response[:course_name]
      assert_not_empty response[:questions]
      assert_not_empty response[:this_workshop]
      assert_equal 6, response[:this_workshop]['Post Workshop'][:general][:response_count]

      assert_not_empty response[:workshop_rollups]

      general_rollup = response[:workshop_rollups][:general]
      assert_equal 6, general_rollup[:overall_facilitator][facilitator_id.to_s.to_sym][:response_count]
    end

    test 'calculates averages across multiple workshops correctly' do
      sign_in @workshop_admin
      csf_workshop_1 = create :csf_workshop,
        started_at:  Time.now.utc - 1.day,
        ended_at: Time.now.utc - 1.hour
      csf_workshop_2 = create :csf_workshop,
        started_at:  Time.now.utc - 1.day,
        ended_at: Time.now.utc - 1.hour
      create_surveys_for_csf_workshop(csf_workshop_1, csf_workshop_1.facilitators.pluck(:id), 3, 2)
      create_surveys_for_csf_workshop(csf_workshop_1, csf_workshop_2.facilitators.pluck(:id), 5, 1)

      get :generic_survey_report, params: {workshop_id: csf_workshop_1.id}
      assert_response :success
      response = JSON.parse(@response.body, symbolize_names: true)

      overall_facilitator_rollup_facilitator = response[:workshop_rollups][:facilitator][:overall_facilitator]
      csf_workshop_1_facilitator = csf_workshop_1.facilitators.pluck(:id).first.to_s.to_sym
      assert_equal 5, overall_facilitator_rollup_facilitator[csf_workshop_1_facilitator][:response_count]
    end

    test 'return unauthorized for unauthorized users' do
      generic_teacher = create :teacher
      other_facilitator = create :facilitator
      program_manager = create :program_manager
      workshop_organizer = create :workshop_organizer
      csf_workshop = create :csf_workshop,
        started_at:  Time.now.utc - 1.day,
        ended_at: Time.now.utc - 1.hour

      this_facilitator = csf_workshop.facilitators[0]

      expected_authorization = [
        {user: this_facilitator, expected_response: :success, type: "facilitator for this workshop"},
        {user: program_manager, expected_response: :success, type: "program manager"},
        {user: workshop_organizer, expected_response: :success, type: "workshop organizer"},
        {user: @workshop_admin, expected_response: :success, type: "workshop admin"},
        {user: generic_teacher, expected_response: :unauthorized, type: "teacher"},
        {user: other_facilitator, expected_response: :unauthorized, type: "other facilitator"}
      ]

      expected_authorization.each do |data|
        sign_in data[:user]
        get :generic_survey_report, params: {workshop_id: csf_workshop.id}
        assert_response data[:expected_response], "#{data[:type]} had an unexpected result"
        sign_out data[:user]
      end
    end

    test 'filters facilitator data if facilitator is signed in' do
      csf_workshop = create :csf_workshop,
        started_at:  Time.now.utc - 1.day,
        ended_at: Time.now.utc - 1.hour,
        num_facilitators: 2
      facilitator_1 = csf_workshop.facilitators[0]
      facilitator_2 = csf_workshop.facilitators[1]
      create_surveys_for_csf_workshop(csf_workshop, csf_workshop.facilitators.pluck(:id), 5, 2)

      # csf_workshop has two facilitators, sign in as facilitator_1
      sign_in facilitator_1
      get :generic_survey_report, params: {workshop_id: csf_workshop.id}
      assert_response :success

      response = JSON.parse(@response.body).with_indifferent_access

      facilitator_1_id = facilitator_1.id.to_s.to_sym
      facilitator_2_id = facilitator_2.id.to_s.to_sym

      assert_equal 7, response[:this_workshop]['Post Workshop'][:facilitator][:response_count][facilitator_1_id]

      overall_facilitator = response[:this_workshop]['Post Workshop'][:facilitator]['surveys/pd/workshop_csf_intro_post_test.0'.to_sym]
      facilitator_effectiveness = overall_facilitator[:facilitator_effectiveness]
      # Verify see results for facilitator 1
      assert_not_nil facilitator_effectiveness[facilitator_1_id][:on_track]
      # Verify do not see results for facilitator 2
      assert_nil facilitator_effectiveness[facilitator_2_id]

      facilitator_rollup = response[:workshop_rollups][:facilitator][:single_workshop][facilitator_1_id]
      # Verify see results for facilitator 1
      assert_equal 5.29, facilitator_rollup[:averages][:facilitator_effectiveness][:rows][:on_track]
      assert_equal 5.29, facilitator_rollup[:averages][:facilitator_effectiveness][:average]
      # Verify do not see results for facilitator 2
      assert_nil response[:workshop_rollups][:facilitator][:single_workshop][facilitator_2_id]
    end

    # Creates sample survey responses for the given workshop with the given facilitator_ids.
    # Will generate both facilitator-specific responses and general responses.
    # @param csf_workshop
    # @param facilitator_ids Array[Integer] facilitator ids to generate survey results for
    # @param high_count Number of submissions with high score responses (maximum score for each response)
    # @param low_count Number of submissions with low score responses (minimum score for each response)
    def create_surveys_for_csf_workshop(csf_workshop, facilitator_ids, high_count, low_count)
      facilitator_ids.each do |facilitator_id|
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
      end
      create_list :csf_intro_post_workshop_submission, low_count, :answers_low, pd_workshop_id: csf_workshop.id
      create_list :csf_intro_post_workshop_submission, high_count, :answers_high, pd_workshop_id: csf_workshop.id
    end

    def create_survey_submission(survey_response)
      submission = ::Foorm::Submission.create(
        form_name: 'surveys/pd/summer_workshop_pre_survey_test',
        form_version: 0,
        answers: survey_response
      )
      create :day_0_workshop_foorm_submission,
        pd_workshop_id: @workshop.id,
        foorm_submission_id: submission.id
    end
  end
end
