require 'test_helper'

module Pd::Application
  class PrincipalApprovalApplicationControllerTest < ::ActionController::TestCase
    include ActiveApplicationModels

    test 'invalid guid goes to not_found page' do
      get :new, params: {application_guid: 'invalid_guid'}
      assert_template :not_found
      assert_response :success
    end

    test 'already completed principal application goes to submitted page' do
      teacher_application = create TEACHER_APPLICATION_FACTORY
      application_guid = teacher_application.application_guid

      create PRINCIPAL_APPROVAL_FACTORY, application_guid: application_guid
      get :new, params: {application_guid: application_guid}
      assert_template :submitted
      assert_response :success
      assert_equal teacher_application.applicant_name, assigns(:teacher_application)[:name]
      assert_equal 'Computer Science Principles', assigns(:teacher_application)[:course]
    end

    test 'completed teacher application but no principal application goes to new page' do
      teacher_application = create TEACHER_APPLICATION_FACTORY
      application_guid = teacher_application.application_guid

      get :new, params: {application_guid: application_guid}
      assert_template :new
      assert_response :success
      assert_equal teacher_application.applicant_name, assigns(:teacher_application)[:name]
      assert_equal 'Computer Science Principles', assigns(:teacher_application)[:course]
    end
  end
end
