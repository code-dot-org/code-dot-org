require 'test_helper'

module Pd::Application
  class TeacherApplicationControllerTest < ::ActionController::TestCase
    include Pd::Application::ActiveApplicationModels

    test 'logged out users see the logged-out message' do
      get :new
      assert_response :success
      assert_template :logged_out
    end

    test 'students see message that they are not a teacher' do
      sign_in create :student
      get :new
      assert_response :success
      assert_template :not_teacher
    end

    test 'teachers without email see message about not having an email' do
      sign_in create :teacher, :without_email
      get :new
      assert_response :success
      assert_template :no_teacher_email
    end

    test 'teachers with a submitted application see submitted message' do
      application = create :pd_teacher_application
      sign_in application.user
      get :new
      assert_response :success
      assert_template :submitted
    end

    test 'teachers with an incomplete application have an application id and saved form data' do
      application = create :pd_teacher_application, form_data_hash: (
        build :pd_teacher_application_hash
      ), status: 'incomplete'
      sign_in application.user
      get :new
      assert_response :success
      assert_template :new

      @script_data = assigns(:script_data)
      assert_equal application.id, JSON.parse(@script_data.dig(:props)).dig('applicationId')
      assert_equal application.form_data, JSON.parse(@script_data.dig(:props)).dig('savedFormData')
      assert_equal application.status, JSON.parse(@script_data.dig(:props)).dig('savedStatus')
    end

    test 'teachers with a reopened application have an application id and saved form data' do
      application = create :pd_teacher_application, form_data_hash: (
        build :pd_teacher_application_hash, :reopened
      )
      sign_in application.user
      get :new
      assert_response :success
      assert_template :new

      @script_data = assigns(:script_data)
      assert_equal application.id, JSON.parse(@script_data.dig(:props)).dig('applicationId')
      assert_equal application.form_data, JSON.parse(@script_data.dig(:props)).dig('savedFormData')
    end

    test 'teachers without an application have no id nor form data' do
      sign_in create :teacher
      get :new
      assert_response :success
      assert_template :new

      @script_data = assigns(:script_data)
      assert_nil JSON.parse(@script_data.dig(:props)).dig('applicationId')
      assert_nil JSON.parse(@script_data.dig(:props)).dig('savedFormData')
    end
  end
end
