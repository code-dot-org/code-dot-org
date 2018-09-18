require 'test_helper'

module Api::V1::Pd::Application
  class TeacherApplicationsControllerTest < ::ActionController::TestCase
    include Pd::Application::ApplicationConstants
    include Pd::Application::ActiveApplicationModels

    setup_all do
      @test_params = {
        form_data: build(TEACHER_APPLICATION_HASH_FACTORY)
      }

      @applicant = create :teacher
    end

    setup do
      TEACHER_APPLICATION_MAILER_CLASS.stubs(:confirmation).returns(
        mock {|mail| mail.stubs(:deliver_now)}
      )

      TEACHER_APPLICATION_MAILER_CLASS.stubs(:principal_approval).returns(
        mock {|mail| mail.stubs(:deliver_now)}
      )
    end

    test_redirect_to_sign_in_for :create
    test_user_gets_response_for :create, user: :student, params: -> {@test_params}, response: :forbidden
    test_user_gets_response_for :create, user: :teacher, params: -> {@test_params}, response: :success

    test 'sends email on successful create' do
      TEACHER_APPLICATION_MAILER_CLASS.expects(:confirmation).
        with(instance_of(TEACHER_APPLICATION_CLASS)).
        returns(mock {|mail| mail.expects(:deliver_now)})

      sign_in @applicant

      put :create, params: @test_params
      assert_response :success
    end

    test 'do not send principal approval email on successful create if RP has selective principal approval' do
      TEACHER_APPLICATION_MAILER_CLASS.expects(:confirmation).
        with(instance_of(TEACHER_APPLICATION_CLASS)).
        returns(mock {|mail| mail.expects(:deliver_now)})

      Pd::Application::PrincipalApproval1819Application.expects(:create_placeholder_and_send_mail).never

      regional_partner = create :regional_partner, applications_principal_approval: RegionalPartner::ALL_REQUIRE_APPROVAL

      Pd::Application::Teacher1819Application.any_instance.stubs(:regional_partner).returns(regional_partner)

      sign_in @applicant

      put :create, params: @test_params
      assert_response :success
    end

    test 'does not send confirmation mail on unsuccessful create' do
      TEACHER_APPLICATION_MAILER_CLASS.expects(:principal_approval).never
      TEACHER_APPLICATION_MAILER_CLASS.expects(:confirmation).never
      Pd::Application::PrincipalApproval1819Application.expects(:create_placeholder_and_send_mail).never

      sign_in @applicant

      put :create, params: {form_data: {firstName: ''}}
      assert_response :bad_request
    end

    test 'submit is idempotent' do
      create TEACHER_APPLICATION_FACTORY, user: @applicant

      sign_in @applicant
      assert_no_difference "#{TEACHER_APPLICATION_CLASS.name}.count" do
        put :create, params: {form_data: @test_params}
      end
      assert_response :success
    end

    test 'updates user school info on successful create' do
      TEACHER_APPLICATION_CLASS.any_instance.expects(:update_user_school_info!)

      sign_in @applicant
      put :create, params: @test_params
    end
  end
end
