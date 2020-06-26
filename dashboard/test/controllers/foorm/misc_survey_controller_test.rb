require 'test_helper'

module Foorm
  class MiscSurveyControllerTest < ActionDispatch::IntegrationTest
    setup do
      @teacher = create :teacher
      @user = create :user
      DCDO.set('foorm_misc_survey_disabled', ['csp_post_course'])
    end

    test 'renders foorm if teacher is logged in' do
      sign_in @teacher

      get '/form/csf_post_course_pd'
      assert_template :new
      assert_response :success
    end

    test 'renders not a teacher if user is not a teacher' do
      sign_in @user

      get '/form/csd_post_course'
      assert_template :not_teacher
      assert_response :success
    end

    test 'renders logged out if not logged in' do
      get '/form/csp_post_course_pd'
      assert_template :logged_out
      assert_response :success
    end

    test 'renders closed if survey has been closed' do
      sign_in @teacher

      get '/form/csp_post_course'
      assert_template :survey_closed
      assert_response :success
    end
  end
end
