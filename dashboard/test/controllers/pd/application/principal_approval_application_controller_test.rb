require 'test_helper'

module Pd::Application
  class PrincipalApprovalApplicationControllerTest < ::ActionController::TestCase
    test 'invalid guid goes to not_found page' do
      get :new, params: {application_guid: 'invalid_guid'}
      assert_template :not_found
      assert_response :success
    end

    test 'already completed principal application goes to submitted page' do
      application_uuid = SecureRandom.uuid
      teacher_application = create :pd_teacher1819_application, application_guid: application_uuid
      create :pd_principal_approval1819_application, application_guid: application_uuid
      get :new, params: {application_guid: application_uuid}
      assert_template :submitted
      assert_response :success
      assert_equal teacher_application, assigns(:teacher_application)
    end

    test 'completed teacher application but no principal application goes to new page' do
      application_uuid = SecureRandom.uuid
      teacher_application = create :pd_teacher1819_application, application_guid: application_uuid

      get :new, params: {application_guid: application_uuid}
      assert_template :new
      assert_response :success
      assert_equal teacher_application, assigns(:teacher_application)
    end

    test 'renders not available on production' do
      Rails.env.stubs(:production?).returns(true)
      get :new, params: {application_guid: 'some_guid'}
      assert_template :not_available
      assert_response :success
      Rails.env.unstub(:production)
    end
  end
end
