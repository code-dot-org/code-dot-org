require 'test_helper'

module Api::V1::Pd::Application
  class TeacherApplicationsControllerTest < ::ActionController::TestCase
    include Pd::Application::ApplicationConstants
    include Pd::Application::ActiveApplicationModels

    self.use_transactional_test_case = true

    setup_all do
      @test_params = {
        form_data: build(TEACHER_APPLICATION_HASH_FACTORY)
      }

      @applicant = create :teacher

      @program_manager = create :program_manager
      @partner = @program_manager.regional_partners.first
      @application = create :pd_teacher1920_application, regional_partner: @partner
    end

    setup do
      Pd::Application::TeacherApplicationMailer.stubs(:confirmation).returns(
        mock {|mail| mail.stubs(:deliver_now)}
      )

      Pd::Application::TeacherApplicationMailer.stubs(:principal_approval).returns(
        mock {|mail| mail.stubs(:deliver_now)}
      )
    end

    test_redirect_to_sign_in_for :create
    test_user_gets_response_for :create, user: :student, params: -> {@test_params}, response: :forbidden
    test_user_gets_response_for :create, user: :teacher, params: -> {@test_params}, response: :success

    test_user_gets_response_for :send_principal_approval,
      name: 'program managers can send_principal_approval for applications they own',
      user: -> {@program_manager},
      params: -> {{id: @application.id}},
      response: :success

    test_user_gets_response_for :send_principal_approval,
      name: 'program managers can not send_principal_approval for applications they do not own',
      user: :program_manager,
      params: -> {{id: @application.id}},
      response: :forbidden

    test 'sends email on successful create' do
      Pd::Application::TeacherApplicationMailer.expects(:confirmation).
        with(instance_of(TEACHER_APPLICATION_CLASS)).
        returns(mock {|mail| mail.expects(:deliver_now)})

      sign_in @applicant

      put :create, params: @test_params
      assert_response :success
    end

    test 'do not send principal approval email on successful create if RP has selective principal approval' do
      Pd::Application::TeacherApplicationMailer.expects(:confirmation).
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
      Pd::Application::TeacherApplicationMailer.expects(:principal_approval).never
      Pd::Application::TeacherApplicationMailer.expects(:confirmation).never
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

    test 'updates course hours computation and autoscores on successful create' do
      application_hash = build(
        TEACHER_APPLICATION_HASH_FACTORY,
        cs_how_many_minutes: 45,
        cs_how_many_days_per_week: 5,
        cs_how_many_weeks_per_year: 30
      )

      sign_in @applicant
      put :create, params: {form_data: application_hash}

      assert_equal 112, TEACHER_APPLICATION_CLASS.last.sanitize_form_data_hash[:cs_total_course_hours]
      assert JSON.parse(TEACHER_APPLICATION_CLASS.last.response_scores).any?
    end

    test 'send_principal_approval queues up an email if none exist' do
      sign_in @program_manager
      assert_creates Pd::Application::Email do
        post :send_principal_approval, params: {id: @application.id}
        assert_response :success
      end
      email = Pd::Application::Email.last
      assert_equal @application, email.application
      assert_equal 'principal_approval', email.email_type
    end

    test 'send_principal_approval does nothing if an email has already been sent' do
      Pd::Application::Email.create!(
        application: @application,
        application_status: @application.status,
        email_type: 'principal_approval',
        to: 'principal@ex.net',
        created_at: Time.now,
        sent_at: Time.now
      )

      sign_in @program_manager
      assert_does_not_create Pd::Application::Email do
        post :send_principal_approval, params: {id: @application.id}
        assert_response :success
      end
    end
  end
end
