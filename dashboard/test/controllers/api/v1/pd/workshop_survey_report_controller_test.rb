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
      AWS::S3.stubs(:download_from_bucket).returns(Hash[@workshop.course.to_sym, {}].to_json)
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

    # TODO: remove this test when workshop_organizer is deprecated
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
      assert_nil response_hash['all_my_local_workshops']['things_facilitator_did_well']
    end

    test 'local workshop survey report for the program manager workshop organizer' do
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
      assert_nil response_hash['all_my_local_workshops']['things_facilitator_did_well']
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

    [:student, :teacher, :facilitator, :workshop_organizer, :program_manager].each do |user|
      test_user_gets_response_for(
        :local_workshop_survey_report,
        response: :forbidden,
        user: user,
        params: -> {{workshop_id: @workshop.id}}
      )
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

    private

    def build_sample_data
      facilitator_1 = create(:facilitator, name: 'Cersei')
      facilitator_2 = create(:facilitator, name: 'Jaime')
      facilitators = [facilitator_1, facilitator_2]
      organizer = create :program_manager
      create :workshop_admin
      workshop_1 = create :summer_workshop, num_enrollments: 3, organizer: organizer, facilitators: facilitators
      workshop_2 = create :summer_workshop, num_enrollments: 3, organizer: organizer, facilitators: facilitators
      create :summer_workshop, num_enrollments: 3, organizer: organizer, facilitators: facilitators

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

      [workshop_1, workshop_2].each do |workshop|
        workshop.start!
        workshop.end!
      end

      return workshop_1, workshop_2
    end
  end
end
