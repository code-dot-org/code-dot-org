require_relative '../../../../shared/test/observability_test_recorder'
require 'test_helper'
module Pd
  class PostCourseSurveyControllerTest < ActionDispatch::IntegrationTest
    include WorkshopConstants

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

    test 'post course survey reports render via observability events' do
      ObservabilityTestRecorder.install

      sign_in create :teacher
      get "/pd/post_course_survey/csp"
      assert_response :success

      events = ObservabilityTestRecorder.get_events(/^RenderJotFormView$/)
      assert_equal 1, events.length, 'one RenderJotFormView event recorded'
      assert_equal(
        {
          'route' => 'GET /pd/post_course_survey/csp',
          'form_id' => PostCourseSurvey.form_id,
        },
        events.first.last
      )
    end
  end
end
