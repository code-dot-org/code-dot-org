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

    test 'post course survey reports render via observability span attributes' do
      ObservabilityTestRecorder.install

      sign_in create :teacher
      get "/pd/post_course_survey/csp"
      assert_response :success

      attrs = ObservabilityTestRecorder.attributes
      assert_equal true, attrs['RenderJotFormView'], 'RenderJotFormView marker recorded'
      assert_equal 'GET /pd/post_course_survey/csp', attrs['RenderJotFormView.route']
      assert_equal PostCourseSurvey.form_id, attrs['RenderJotFormView.form_id']
    end
  end
end
