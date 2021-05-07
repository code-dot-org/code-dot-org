require 'test_helper'

module Foorm
  class SimpleSurveyControllerTest < ActionDispatch::IntegrationTest
    setup do
      @teacher = create :teacher
      @user = create :user
      @foorm_form = create :foorm_form
      @simple_survey_form = create :foorm_simple_survey_form, form_name: @foorm_form.name
      @disabled_simple_survey_form = create :foorm_simple_survey_form, form_name: @foorm_form.name, path: 'disabled_path'
      DCDO.set('foorm_simple_survey_disabled', [@disabled_simple_survey_form.path])
    end

    test 'renders foorm if teacher is logged in' do
      sign_in @teacher

      get "/form/#{@simple_survey_form.path}"
      assert_template :new
      assert_response :success
    end

    test 'renders not a teacher if user is not a teacher' do
      sign_in @user

      get "/form/#{@simple_survey_form.path}"
      assert_template :not_teacher
      assert_response :success
    end

    test 'renders logged out if not logged in' do
      get "/form/#{@simple_survey_form.path}"
      assert_template :logged_out
      assert_response :success
    end

    test 'renders closed if survey has been closed' do
      sign_in @teacher

      get "/form/#{@disabled_simple_survey_form.path}"
      assert_template :survey_closed
      assert_response :success
    end
  end
end
