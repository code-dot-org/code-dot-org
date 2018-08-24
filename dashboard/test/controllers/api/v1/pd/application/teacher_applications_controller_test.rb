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

      TEACHER_APPLICATION_MAILER_CLASS.expects(:principal_approval).
        with(instance_of(TEACHER_APPLICATION_CLASS)).
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
          csp_how_offer: 2,
          taught_in_past: 2
        }, TEACHER_APPLICATION_CLASS.last.response_scores_hash
      )
    end

    test 'does not send confirmation mail on unsuccessful create' do
      TEACHER_APPLICATION_MAILER_CLASS.expects(:principal_approval).never
      TEACHER_APPLICATION_MAILER_CLASS.expects(:confirmation).never
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

    test 'auto-scores on successful create' do
      TEACHER_APPLICATION_CLASS.any_instance.expects(:auto_score!)

      sign_in @applicant
      put :create, params: @test_params
    end

    test 'assigns default workshop on successful create' do
      TEACHER_APPLICATION_CLASS.any_instance.expects(:assign_default_workshop!)

      sign_in @applicant
      put :create, params: @test_params
    end

    test 'updates user school info on successful create' do
      TEACHER_APPLICATION_CLASS.any_instance.expects(:update_user_school_info!)

      sign_in @applicant
      put :create, params: @test_params
    end
  end
end
