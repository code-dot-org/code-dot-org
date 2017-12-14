require 'test_helper'

module Api::V1::Pd::Application
  class TeacherApplicationsControllerTest < ::ActionController::TestCase
    include Pd::Application::ApplicationConstants

    setup_all do
      @test_params = {
        form_data: build(:pd_teacher1819_application_hash)
      }

      @applicant = create :teacher
    end

    setup do
      Pd::Application::Teacher1819ApplicationMailer.stubs(:confirmation).returns(
        mock {|mail| mail.stubs(:deliver_now)}
      )
      Pd::Application::Teacher1819ApplicationMailer.stubs(:principal_approval).returns(
        mock {|mail| mail.stubs(:deliver_now)}
      )
    end

    test_redirect_to_sign_in_for :create
    test_user_gets_response_for :create, user: :student, params: -> {@test_params}, response: :forbidden
    test_user_gets_response_for :create, user: :teacher, params: -> {@test_params}, response: :success

    test 'sends email on successful create' do
      Pd::Application::Teacher1819ApplicationMailer.expects(:confirmation).
        with(instance_of(Pd::Application::Teacher1819Application)).
        returns(mock {|mail| mail.expects(:deliver_now)})

      Pd::Application::Teacher1819ApplicationMailer.expects(:principal_approval).
        with(instance_of(Pd::Application::Teacher1819Application)).
        returns(mock {|mail| mail.expects(:deliver_now)})

      sign_in @applicant

      put :create, params: @test_params
      assert_response :success
      assert_equal(
        {
          regional_partner_name: NO,
          committed: YES,
          able_to_attend_single: YES,
          csp_which_grades: YES,
          csp_course_hours_per_year: YES,
          previous_yearlong_cdo_pd: YES,
          csp_ap_exam: YES,
          taught_in_past: 2
        }, Pd::Application::Teacher1819Application.last.response_scores_hash
      )
    end

    test 'does not send confirmation mail on unsuccessful create' do
      Pd::Application::Teacher1819ApplicationMailer.expects(:confirmation).never
      Pd::Application::Teacher1819ApplicationMailer.expects(:principal_approval).never
      sign_in @applicant

      put :create, params: {form_data: {firstName: ''}}
      assert_response :bad_request
    end

    test 'submit is idempotent' do
      create :pd_teacher1819_application, user: @applicant

      sign_in @applicant
      assert_no_difference 'Pd::Application::Teacher1819Application.count' do
        put :create, params: {form_data: @test_params}
      end
      assert_response :success
    end
  end
end
