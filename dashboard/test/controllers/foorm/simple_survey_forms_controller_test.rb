require 'test_helper'

module Foorm
  class SimpleSurveyFormsControllerTest < ActionDispatch::IntegrationTest
    setup do
      @admin = create :admin
      @teacher = create :teacher
      @user = create :user
      @foorm_form = create :foorm_form
      @simple_survey_form = create :foorm_simple_survey_form, form_name: @foorm_form.name
      @disabled_simple_survey_form = create :foorm_simple_survey_form, form_name: @foorm_form.name, path: 'disabled_path'

      @base_success_params = {
        path: 'test_url_path',
        kind: '',
        form_key: @foorm_form.key,
        allow_multiple_submissions: '1'
      }

      DCDO.set('foorm_simple_survey_disabled', [@disabled_simple_survey_form.path])
    end

    test 'renders form if teacher is logged in' do
      sign_in @teacher

      get "/form/#{@simple_survey_form.path}"
      assert_template :show
      assert_response :success
    end

    test 'configuration path renders form json if teacher is logged in' do
      sign_in @teacher

      get "/form/#{@simple_survey_form.path}/configuration"
      assert_response :success
      assert_equal 'application/json', @response.content_type
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

    test 'non-admin cannot access admin only simple survey forms' do
      sign_in @teacher

      get foorm_simple_survey_forms_path
      assert_response :forbidden

      get new_foorm_simple_survey_form_path
      assert_response :forbidden

      post foorm_simple_survey_forms_path
      assert_response :forbidden
    end

    test 'admin can access list of simple survey forms' do
      sign_in @admin

      get foorm_simple_survey_forms_path
      assert_response :success
    end

    test 'admin can create new simple survey form' do
      sign_in @admin

      post foorm_simple_survey_forms_path, params: @base_success_params
      assert_response :success

      created_simple_survey_form = Foorm::SimpleSurveyForm.find_by(path: 'test_url_path')
      assert created_simple_survey_form
      assert_equal 'test_url_path', created_simple_survey_form.path
      assert_nil created_simple_survey_form.kind
      assert_equal @foorm_form.name, created_simple_survey_form.form_name
      assert_equal @foorm_form.version, created_simple_survey_form.form_version
      assert_equal({'allow_multiple_submissions' => true}, created_simple_survey_form.properties)
    end

    test 'creating simple survey form with invalid form fails' do
      sign_in @admin

      post foorm_simple_survey_forms_path, params: {
        path: 'test_url_path',
        form_key: 'a_form_that_does_not_exist.0',
        allow_multiple_submissions: '1'
      }

      assert_response :bad_request
    end

    test 'admin can successfully create new simple survey form with survey data' do
      sign_in @admin

      post foorm_simple_survey_forms_path, params: @base_success_params.merge(
        {
          survey_data_key_1: 'a_key',
          survey_data_value_1: 'a_value'
        }
      )
      assert_response :success

      expected_survey_data = {'a_key' => 'a_value'}

      created_simple_survey_form = Foorm::SimpleSurveyForm.find_by(path: 'test_url_path')
      assert_equal expected_survey_data, created_simple_survey_form.properties['survey_data']
    end

    test 'parse_survey_data raises error when key provided with no value' do
      sign_in @admin

      post foorm_simple_survey_forms_path, params: @base_success_params.merge(survey_data_key_1: 'a_key')

      assert_equal 'Must provide a name and value for any survey variables.', JSON.parse(@response.body)['error']
    end
  end
end
