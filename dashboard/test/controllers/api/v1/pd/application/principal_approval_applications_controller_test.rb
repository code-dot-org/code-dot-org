require 'test_helper'

module Api::V1::Pd::Application
  class PrincipalApprovalApplicationsControllerTest < ::ActionController::TestCase
    setup_all do
      @teacher_application = create :pd_teacher1819_application
      @test_params = {
        form_data: build(:pd_principal_approval1819_application_hash),
        application_guid: @teacher_application.application_guid
      }
    end

    setup do
      ::Pd::Application::Teacher1819ApplicationMailer.stubs(:principal_approval_received).returns(
        mock {|mail| mail.stubs(:deliver_now)}
      )
    end

    # no log in required
    test_user_gets_response_for :create, method: :put, user: nil, params: -> {@test_params}, response: :success

    test 'Updates user and application_guid upon submit' do
      principal = create :teacher
      sign_in principal

      assert_creates(Pd::Application::PrincipalApproval1819Application) do
        put :create, params: @test_params
        assert_response :success
      end

      application = Pd::Application::PrincipalApproval1819Application.find_by!(
        application_guid: @teacher_application.application_guid
      )
      assert_equal principal, application.user
    end

    test 'Sends principal approval received email on successful create' do
      ::Pd::Application::Teacher1819ApplicationMailer.expects(:principal_approval_received).
        with(@teacher_application).
        returns(mock {|mail| mail.expects(:deliver_now)})

      put :create, params: @test_params
      assert_response :success
    end

    test 'Does not send email on unsuccessful create' do
      ::Pd::Application::Teacher1819ApplicationMailer.expects(:principal_approval_received).never

      put :create, params: {form_data: {first_name: ''}, application_guid: 'invalid'}
      assert_response :bad_request
    end

    test 'submit is idempotent' do
      create :pd_principal_approval1819_application, teacher_application: @teacher_application

      assert_no_difference 'Pd::Application::PrincipalApproval1819Application.count' do
        put :create, params: @test_params
      end
      assert_response :success
    end
  end
end
