require 'test_helper'

module Api::V1::Pd::Application
  class TeacherApplicationsControllerTest < ::ActionController::TestCase
    include Pd::Application::ApplicationConstants
    include Pd::Application::ActiveApplicationModels

    self.use_transactional_test_case = true

    setup_all do
      Pd::Application::ApplicationBase.any_instance.stubs(:deliver_email)

      @test_params = {
        form_data: build(TEACHER_APPLICATION_HASH_FACTORY)
      }

      @applicant = create :teacher

      @program_manager = create :program_manager
      partner = @program_manager.regional_partners.first
      partner.update!(applications_principal_approval: RegionalPartner::ALL_REQUIRE_APPROVAL)
      @hash_with_admin_approval = build TEACHER_APPLICATION_HASH_FACTORY, regional_partner_id: partner.id
      @application = create TEACHER_APPLICATION_FACTORY, form_data_hash: @hash_with_admin_approval

      @program_manager_without_admin_approval = create :program_manager
      partner_without_admin_approval = @program_manager_without_admin_approval.regional_partners.first
      partner_without_admin_approval.update!(applications_principal_approval: RegionalPartner::SELECTIVE_APPROVAL)
      @hash_without_admin_approval = build TEACHER_APPLICATION_HASH_FACTORY, regional_partner_id: partner_without_admin_approval.id
    end

    test_redirect_to_sign_in_for :create
    test_user_gets_response_for :create, user: :student, params: -> {@test_params}, response: :forbidden
    test_user_gets_response_for :create, user: :teacher, params: -> {@test_params}, response: :success

    test_redirect_to_sign_in_for :update, params: -> {{id: @application.id}}
    test_user_gets_response_for :update, user: :student, params: -> {{id: @application.id}}, response: :forbidden

    test_user_gets_response_for :update,
      name: 'a teacher cannot update an application they do not own',
      user: :teacher,
      params: -> {{id: @application.id}},
      response: :forbidden

    test_user_gets_response_for :update,
      name: 'a teacher can update an application they own',
      user:  -> {User.find_by(id: @application.user_id)},
      params: -> {{id: @application.id}},
      response: :success

    test_user_gets_response_for :change_principal_approval_requirement,
                                name: 'program managers can set change_principal_approval_requirement for applications they own',
                                user: -> {@program_manager},
                                params: -> {{id: @application.id, principal_approval_not_required: true}},
                                response: :success

    test_user_gets_response_for :change_principal_approval_requirement,
                                name: 'program managers cannot set change_principal_approval_requirement for applications they do not own',
                                user: :program_manager,
                                params: -> {{id: @application.id}},
                                response: :forbidden

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
      sign_in @applicant

      put :create, params: @test_params
      application = TEACHER_APPLICATION_CLASS.last
      assert_response :success
      assert_equal 1, application.emails.where.not(sent_at: nil).where(email_type: 'confirmation').count
    end

    test 'does not create principal approval email on successful create if RP has selective principal approval' do
      sign_in @applicant
      Pd::Application::TeacherApplicationMailer.expects(:admin_approval).never

      put :create, params: {form_data: @hash_without_admin_approval}
      application = TEACHER_APPLICATION_CLASS.last
      assert_response :success
      assert_equal 1, application.emails.where(email_type: 'confirmation').count
    end

    test 'does not create confirmation mail on unsuccessful create' do
      Pd::Application::TeacherApplicationMailer.expects(:admin_approval).never
      Pd::Application::TeacherApplicationMailer.expects(:confirmation).never
      PRINCIPAL_APPROVAL_APPLICATION_CLASS.expects(:create_placeholder_and_send_mail).never

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
    end

    test 'submitting an application without RP requiring admin approval has \'unreviewed\' status' do
      sign_in @applicant
      put :create, params: {form_data: @hash_without_admin_approval}
      assert_response :success
      assert_equal 'unreviewed', TEACHER_APPLICATION_CLASS.last.status
    end

    test 'submitting an application with RP requiring admin approval has \'awaiting admin approval\' status' do
      sign_in @applicant
      put :create, params: {form_data: @hash_with_admin_approval}
      assert_response :success
      assert_equal 'awaiting_admin_approval', TEACHER_APPLICATION_CLASS.last.status
    end

    test 'updating an application with RP requiring admin approval is \'unreviewed\' if the principal approval is complete'  do
      sign_in @applicant
      application = create TEACHER_APPLICATION_FACTORY, form_data_hash: @hash_with_admin_approval, user: @applicant, status: 'awaiting_admin_approval'
      assert_equal 'awaiting_admin_approval', TEACHER_APPLICATION_CLASS.last.status

      application.update!(status: 'reopened')
      assert_equal 'reopened', TEACHER_APPLICATION_CLASS.last.status

      # while the application is reopened, the principal approval gets submitted
      create :pd_principal_approval_application, teacher_application: application
      put :update, params: {id: application.id}
      assert_response :success
      assert_equal 'unreviewed', TEACHER_APPLICATION_CLASS.last.status
    end

    test 'creating an application on an existing form renders conflict' do
      sign_in @applicant
      application = create TEACHER_APPLICATION_FACTORY, user: @applicant
      post :create, params:  {
        id: application.id
      }
      assert_response :conflict
    end

    test 'updating an application with an error renders bad_request' do
      sign_in @applicant
      application = create TEACHER_APPLICATION_FACTORY, user: @applicant

      put :update, params: {id: application.id, form_data: @test_params, application_year: nil}
      assert_response :bad_request
    end

    test 'updates user school info on successful create' do
      TEACHER_APPLICATION_CLASS.any_instance.expects(:update_user_school_info!)

      sign_in @applicant
      put :create, params: @test_params
    end

    test 'does not send emails or autoscore on successful create if application status is incomplete' do
      Pd::Application::TeacherApplicationMailer.expects(:confirmation).never
      Pd::Application::TeacherApplicationMailer.expects(:admin_approval).never

      sign_in @applicant
      put :create, params: {form_data_hash: @test_params, isSaving: true}
      refute TEACHER_APPLICATION_CLASS.last.response_scores
      assert_response :created
    end

    test 'autoscores and sends emails on submit when approval is required' do
      sign_in @applicant
      put :create, params: {form_data: @hash_with_admin_approval, isSaving: false}
      application = TEACHER_APPLICATION_CLASS.last
      assert_equal 'awaiting_admin_approval', application.status
      assert_equal 1, application.emails.where.not(sent_at: nil).where(email_type: 'confirmation').count
      assert_equal 1, application.emails.where.not(sent_at: nil).where(email_type: 'admin_approval').count
      assert JSON.parse(TEACHER_APPLICATION_CLASS.last.response_scores).any?
      assert_response :created
    end

    test 'autoscores and sends only confirmation email on submit when approval is not required' do
      sign_in @applicant
      Pd::Application::TeacherApplicationMailer.expects(:admin_approval).never

      put :create, params: {form_data: @hash_without_admin_approval, isSaving: false}
      application = TEACHER_APPLICATION_CLASS.last
      assert_equal 'unreviewed', application.status
      assert_equal 1, application.emails.where.not(sent_at: nil).where(email_type: 'confirmation').count
      assert JSON.parse(TEACHER_APPLICATION_CLASS.last.response_scores).any?
      assert_response :created
    end

    test 'autoscores and sends emails once incomplete apps are submitted with approval required' do
      application = create TEACHER_APPLICATION_FACTORY, form_data_hash: @hash_with_admin_approval, user: @applicant, status: 'incomplete'

      sign_in @applicant
      put :update, params: {id: application.id, form_data: @hash_with_admin_approval, isSaving: false}
      application = TEACHER_APPLICATION_CLASS.last
      assert_equal 'awaiting_admin_approval', application.status
      assert_equal 1, application.emails.where.not(sent_at: nil).where(email_type: 'confirmation').count
      assert_equal 1, application.emails.where.not(sent_at: nil).where(email_type: 'admin_approval').count
      assert JSON.parse(TEACHER_APPLICATION_CLASS.last.response_scores).any?
      assert_response :ok
    end

    test 'autoscores and sends only confirmation email once incomplete apps are submitted with approval not required' do
      application = create TEACHER_APPLICATION_FACTORY, form_data_hash: @hash_without_admin_approval, user: @applicant, status: 'incomplete'
      Pd::Application::TeacherApplicationMailer.expects(:admin_approval).never

      sign_in @applicant
      put :update, params: {id: application.id, form_data: @hash_without_admin_approval, isSaving: false}
      application = TEACHER_APPLICATION_CLASS.last
      assert_equal 'unreviewed', application.status
      assert_equal 1, application.emails.where.not(sent_at: nil).where(email_type: 'confirmation').count
      assert JSON.parse(TEACHER_APPLICATION_CLASS.last.response_scores).any?
      assert_response :ok
    end

    test 'can submit an empty form if application is incomplete' do
      sign_in @applicant
      put :create, params: {isSaving: true}

      assert_equal 'incomplete', TEACHER_APPLICATION_CLASS.last.status
      assert_response :created
    end

    test 'updating an application with empty form data updates appropriate fields' do
      sign_in @applicant
      application = create TEACHER_APPLICATION_FACTORY, user: @applicant
      original_data = application.form_data_hash
      original_school_info = @applicant.school_info

      put :update, params: {id: application.id, isSaving: true}
      application.reload
      assert_equal original_data, application.form_data_hash
      assert_equal original_school_info, @applicant.school_info
      assert_response :ok
    end

    test 'making principal approval required updates status to \'awaiting_admin_approval\' and sends email' do
      application = create TEACHER_APPLICATION_FACTORY, form_data_hash: @hash_without_admin_approval, user: @applicant, status: 'unreviewed'
      sign_in @program_manager_without_admin_approval

      post :change_principal_approval_requirement, params: {id: application.id, principal_approval_not_required: false}
      assert_equal 1, application.reload.emails.where.not(sent_at: nil).where(email_type: 'needs_admin_approval').count
      assert_response :success
      assert_equal 'awaiting_admin_approval', application.reload.status
    end

    test 'making principal approval not required only updates status to \'unreviewed\' if it was \'awaiting_admin_approval\'' do
      application = create TEACHER_APPLICATION_FACTORY, form_data_hash: @hash_with_admin_approval, user: @applicant, status: 'awaiting_admin_approval'
      sign_in @program_manager

      post :change_principal_approval_requirement, params: {id: application.id, principal_approval_not_required: true}
      assert_response :success
      assert_equal 'unreviewed', application.reload.status
    end

    test 'making principal approval not required does not change status if it was not \'awaiting_admin_approval\'' do
      application = create TEACHER_APPLICATION_FACTORY, form_data_hash: @hash_with_admin_approval, user: @applicant, status: 'pending'
      sign_in @program_manager

      post :change_principal_approval_requirement, params: {id: application.id, principal_approval_not_required: true}
      assert_response :success
      assert_equal 'pending', application.reload.status
    end

    test 'change_principal_approval_requirement can set principal_approval_not_required to true' do
      sign_in @program_manager

      refute @application.principal_approval_not_required
      post :change_principal_approval_requirement, params: {id: @application.id, principal_approval_not_required: true}
      assert_response :success
      assert @application.reload.principal_approval_not_required
    end

    test 'change_principal_approval_requirement can set principal_approval_not_required to false' do
      application = create TEACHER_APPLICATION_FACTORY, form_data_hash: @hash_with_admin_approval, user: @applicant, status: 'incomplete'
      sign_in @program_manager
      application.update!(principal_approval_not_required: true)

      assert application.principal_approval_not_required
      post :change_principal_approval_requirement, params: {id: application.id, principal_approval_not_required: false}
      assert_response :success
      refute application.reload.principal_approval_not_required
    end

    test 'send_principal_approval sends an email if none exist' do
      sign_in @program_manager
      @application.update!(status: 'awaiting_admin_approval')
      @application.update!(principal_approval_not_required: false)
      assert_creates Pd::Application::Email do
        post :send_principal_approval, params: {id: @application.id}
        assert_response :success
      end
      email = Pd::Application::Email.last
      assert_equal @application, email.application
      assert_equal 'admin_approval', email.email_type
      refute_nil email.sent_at
    end

    test 'send_principal_approval does nothing if an email has already been sent' do
      Pd::Application::Email.create!(
        application: @application,
        application_status: @application.status,
        email_type: 'admin_approval',
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
