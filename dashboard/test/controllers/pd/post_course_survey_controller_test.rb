require_relative '../../../../shared/test/spy_newrelic_agent'
require 'test_helper'
module Pd
  class PostCourseSurveyControllerTest < ActionDispatch::IntegrationTest
    include WorkshopConstants

    self.use_transactional_test_case = true

    FAKE_FORM_ID = 123459

    setup do
      CDO.stubs(:jotform_forms).returns(
        {
          post_course: {
            '2018-2019' => FAKE_FORM_ID
          },
        }.deep_stringify_keys
      )
    end

    test 'post course survey reports render to New Relic' do
      NewRelic::Agent.expects(:record_custom_event).with(
        'RenderJotFormView',
        {
          route: "GET /pd/post_course_survey/csp",
          form_id: PostCourseSurvey.form_id,
        }
      )
      CDO.stubs(:newrelic_logging).returns(true)

      sign_in create :teacher
      get "/pd/post_course_survey/csp"
      assert_response :success
    end
  end
end
