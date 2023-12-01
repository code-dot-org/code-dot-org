require 'test_helper'

module Api::V1::Pd::Application
  class PrincipalApprovalApplicationsControllerTest < ::ActionController::TestCase
    include Pd::Application::ActiveApplicationModels
    include Pd::Application::ApplicationConstants

    self.use_transactional_test_case = true

    setup_all do
      Pd::Application::ApplicationBase.any_instance.stubs(:deliver_email)
      @teacher_application = create TEACHER_APPLICATION_FACTORY, application_guid: SecureRandom.uuid
      @test_params = {
        form_data: build(PRINCIPAL_APPROVAL_HASH_FACTORY, :approved_yes),
        application_guid: @teacher_application.application_guid
      }
    end

    ADMIN_APPROVAL_EMAILS = [
      :admin_approval_completed,
      :admin_approval_completed_partner,
      :admin_approval_completed_teacher_receipt
    ]

    setup do
      ADMIN_APPROVAL_EMAILS.each do |email_type|
        Pd::Application::TeacherApplicationMailer.stubs(email_type).returns(
          mock {|mail| mail.stubs(:deliver_now)}
        )
      end
    end

    # no log in required
    test_user_gets_response_for :create, method: :put, user: nil, params: -> {@test_params}, response: :success

    test 'Updates user and application_guid upon submit' do
      principal = create :teacher
      sign_in principal

      assert_creates(PRINCIPAL_APPROVAL_APPLICATION_CLASS) do
        put :create, params: @test_params
        assert_response :success
      end

      PRINCIPAL_APPROVAL_APPLICATION_CLASS.find_by!(
        application_guid: @teacher_application.application_guid
      )

      @teacher_application.reload
      expected_principal_fields = {
        principal_approval: 'Yes',
        principal_schedule_confirmed: "Yes, I plan to include this course in the #{@teacher_application.year} master schedule",
        principal_free_lunch_percent: '50.00%',
        principal_underrepresented_minority_percent: '52.00%',
        principal_wont_replace_existing_course: PRINCIPAL_APPROVAL_APPLICATION_CLASS.options[:replace_course][1],
      }
      actual_principal_fields = @teacher_application.sanitized_form_data_hash.slice(*expected_principal_fields.keys)
      assert_equal expected_principal_fields, actual_principal_fields
    end

    test 'application update contains replaced courses' do
      teacher_application = create TEACHER_APPLICATION_FACTORY, application_guid: SecureRandom.uuid

      test_params = {
        application_guid: teacher_application.application_guid,
        form_data: build(PRINCIPAL_APPROVAL_HASH_FACTORY).merge(
          {
            replace_course: 'Yes'
          }.stringify_keys
        )
      }

      assert_creates(PRINCIPAL_APPROVAL_APPLICATION_CLASS) do
        put :create, params: test_params
        assert_response :success
      end

      assert_equal(
        'Yes',
        teacher_application.reload.sanitized_form_data_hash[:principal_wont_replace_existing_course]
      )
    end

    test 'application update includes Other fields' do
      teacher_application = create TEACHER_APPLICATION_FACTORY, application_guid: SecureRandom.uuid

      test_params = {
        application_guid: teacher_application.application_guid,
        form_data: build(PRINCIPAL_APPROVAL_HASH_FACTORY,
          do_you_approve: "Other:",
          do_you_approve_other: "this is the other for do you approve",
          replace_course: "I don't know (Please Explain):",
          replace_course_other: "this is the other for replace course"
        )
      }

      assert_creates(PRINCIPAL_APPROVAL_APPLICATION_CLASS) do
        put :create, params: test_params
        assert_response :success
      end

      expected_principal_fields = {
        principal_approval: "Other: this is the other for do you approve",
        principal_schedule_confirmed: "Other: this is the other for master schedule",
        principal_wont_replace_existing_course: "I don't know (Please Explain): this is the other for replace course",
      }
      actual_principal_fields = teacher_application.reload.sanitized_form_data_hash.select do |k, _|
        expected_principal_fields.key?(k)
      end

      assert_equal expected_principal_fields, actual_principal_fields
    end

    test 'Sends principal approval received emails on successful create' do
      ADMIN_APPROVAL_EMAILS.each do |email_type|
        TEACHER_APPLICATION_CLASS.any_instance.expects(:send_pd_application_email).with(email_type)
      end

      put :create, params: @test_params
      assert_response :success
    end

    test 'Does not send emails on unsuccessful create' do
      ADMIN_APPROVAL_EMAILS.each do |email_type|
        Pd::Application::TeacherApplicationMailer.expects(email_type).never
      end

      put :create, params: {form_data: {first_name: ''}, application_guid: 'invalid'}
      assert_response :bad_request
    end

    test 'submit is idempotent' do
      create PRINCIPAL_APPROVAL_FACTORY, teacher_application: @teacher_application

      assert_no_difference "#{PRINCIPAL_APPROVAL_APPLICATION_CLASS.name}.count" do
        put :create, params: @test_params
      end
      assert_response :conflict
    end

    test 'application gets autoscored upon submission' do
      put :create, params: @test_params

      @teacher_application.reload

      assert_equal YES, @teacher_application.response_scores_hash[:meets_minimum_criteria_scores][:principal_approval]
    end
  end
end
