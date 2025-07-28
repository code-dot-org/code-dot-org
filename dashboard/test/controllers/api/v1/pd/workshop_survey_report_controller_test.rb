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

    test 'facilitators cannot see results for other types of workshops' do
      workshop = build :csf_intro_workshop, facilitators: [@facilitator]
      workshop.save(validate: false)
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
  end
end
