require 'test_helper'

module Api::V1::Pd
  class WorkshopSurveyFoormReportControllerTest < ::ActionController::TestCase
    self.use_transactional_test_case = true
    setup_all do
      @workshop = create :csd_summer_workshop
      create :csd_workshop_foorm_submission_low, pd_workshop_id: @workshop.id
      create_list :csd_workshop_foorm_submission_high, 3, pd_workshop_id: @workshop.id
    end

    test 'get generic survey report correctly' do
      get :generic_survey_report, params: {workshop_id: @workshop.id}
      assert_response :success

      response = JSON.parse(@response.body, symbolize_names: true)

      assert_equal 'CS Discoveries', response[:course_name]
      assert_not_empty response[:questions]
      assert_not_empty response[:this_workshop]
      assert_equal 4, response[:this_workshop]['Day 5'.to_sym][:response_count]

      assert_not_empty response[:workshop_rollups]
      assert_equal 5.5, response[:workshop_rollups][:single_workshop][:averages][:teacher_engagement][:average]
    end
  end
end
