require 'test_helper'

module Api::V1::Pd
  class WorkshopSurveyReportControllerTest < ::ActionController::TestCase
    include Pd::WorkshopConstants

    self.use_transactional_test_case = true
    setup_all do
      @facilitator = create :facilitator
      @program_manager = create :program_manager
      @workshop = create(:workshop, organizer: @program_manager, facilitators: [@facilitator])
      @admin = create :workshop_admin
    end

    setup do
      @controller.stubs(:get_score_for_workshops)
      AWS::S3.stubs(:download_from_bucket).returns({@workshop.course.to_sym => {}}.to_json)
    end

    API = '/api/v1/pd/workshops'

    test 'teachercon survey report for facilitator' do
      teachercon_1 = create :workshop, :teachercon, num_facilitators: 2, num_sessions: 5, num_completed_surveys: 10
      teachercon_2 = create :workshop, :teachercon, facilitators: teachercon_1.facilitators, num_sessions: 5, num_completed_surveys: 10

      [teachercon_1, teachercon_2].each do |teachercon|
        teachercon.start!
        teachercon.end!
      end

      sign_in(teachercon_1.facilitators.first)

      get :teachercon_survey_report, params: {workshop_id: teachercon_1}
      assert_response :success
      response_hash = JSON.parse(@response.body)

      assert_equal 10, response_hash['this_teachercon']['num_enrollments']
      assert_equal 20, response_hash['all_my_teachercons']['num_enrollments']

      assert_equal 6, response_hash['this_teachercon']['personal_learning_needs_met']
      assert_equal 6, response_hash['all_my_teachercons']['personal_learning_needs_met']

      assert_equal Array.new(10, 'Free Response'), response_hash['this_teachercon']['things_facilitator_did_well']
      assert_nil response_hash['all_my_teachercons']['things_facilitator_did_well']
    end

    test 'teachercon survey report for workshop organizer' do
      teachercon_1 = create :workshop, :teachercon, num_facilitators: 2, num_sessions: 5, num_completed_surveys: 10
      teachercon_2 = create :workshop, :teachercon, organizer: teachercon_1.organizer, num_facilitators: 2, num_sessions: 5, num_completed_surveys: 10

      [teachercon_1, teachercon_2].each do |teachercon|
        teachercon.start!
        teachercon.end!
      end

      sign_in(teachercon_1.organizer)

      get :teachercon_survey_report, params: {workshop_id: teachercon_1}
      assert_response :success
      response_hash = JSON.parse(@response.body)

      assert_equal 10, response_hash['this_teachercon']['num_enrollments']
      assert_equal 20, response_hash['all_my_teachercons']['num_enrollments']

      assert_equal 6, response_hash['this_teachercon']['personal_learning_needs_met']
      assert_equal 6, response_hash['all_my_teachercons']['personal_learning_needs_met']

      expected = {}
      expected[teachercon_1.facilitators.first.name] = Array.new(10, 'Free Response')
      expected[teachercon_1.facilitators.second.name] = Array.new(10, 'Free Response')

      assert_equal expected, response_hash['this_teachercon']['things_facilitator_did_well']
      assert_nil response_hash['all_my_teachercons']['things_facilitator_did_well']
    end

    test 'teachercon survey report for program manager workshop organizer' do
      teachercon_1 = create :workshop, :teachercon, organizer: @program_manager, num_facilitators: 2, num_sessions: 5, num_completed_surveys: 10
      teachercon_2 = create :workshop, :teachercon, organizer: teachercon_1.organizer, num_facilitators: 2, num_sessions: 5, num_completed_surveys: 10

      [teachercon_1, teachercon_2].each do |teachercon|
        teachercon.start!
        teachercon.end!
      end

      sign_in(teachercon_1.organizer)

      get :teachercon_survey_report, params: {workshop_id: teachercon_1}
      assert_response :success
      response_hash = JSON.parse(@response.body)

      assert_equal 10, response_hash['this_teachercon']['num_enrollments']
      assert_equal 20, response_hash['all_my_teachercons']['num_enrollments']

      assert_equal 6, response_hash['this_teachercon']['personal_learning_needs_met']
      assert_equal 6, response_hash['all_my_teachercons']['personal_learning_needs_met']

      expected = {}
      expected[teachercon_1.facilitators.first.name] = Array.new(10, 'Free Response')
      expected[teachercon_1.facilitators.second.name] = Array.new(10, 'Free Response')

      assert_equal expected, response_hash['this_teachercon']['things_facilitator_did_well']
      assert_nil response_hash['all_my_teachercons']['things_facilitator_did_well']
    end

    test 'facilitators cannot see results for other types of workshops' do
      workshop = create :csf_intro_workshop, facilitators: [@facilitator]
      sign_in @facilitator

      get :generic_survey_report, params: {workshop_id: workshop.id}
      result = JSON.parse(@response.body)

      assert_response :bad_request
      assert result['errors']&.present?
      assert result['errors'].first["message"]&.start_with?(
        'Action generic_survey_report should not be used for this workshop'
      )
    end

    test 'generic_survey_report: return empty result for workshop without responds' do
      ayw_ws = create :csp_academic_year_workshop

      expected_result = {
        "course_name" => nil,
        "questions" => {},
        "this_workshop" => {},
      }

      sign_in @admin
      get :generic_survey_report, params: {workshop_id: ayw_ws.id}
      result = JSON.parse(@response.body).slice(*expected_result.keys)

      assert_equal expected_result, result
      assert_response :success
    end

    test 'generic_survey_report: CSF201 workshop uses new pipeline' do
      csf_201_ws = create :csf_deep_dive_workshop

      WorkshopSurveyReportController.any_instance.expects(:create_csf_survey_report)

      sign_in @admin
      get :generic_survey_report, params: {workshop_id: csf_201_ws.id}

      assert_response :success
    end

    test 'generic_survey_report: CSF101 workshop cannot invoke this action' do
      csf_101_ws = create :csf_intro_workshop

      WorkshopSurveyReportController.any_instance.expects(:create_csf_survey_report).never
      WorkshopSurveyReportController.any_instance.expects(:local_workshop_daily_survey_report).never
      Honeybadger.expects(:notify)

      sign_in @admin
      get :generic_survey_report, params: {workshop_id: csf_101_ws.id}

      assert_response :bad_request
    end
  end
end
