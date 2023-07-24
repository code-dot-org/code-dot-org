require 'test_helper'

module Pd::Application
  class PrincipalApprovalApplicationTest < ActiveSupport::TestCase
    setup_all do
      Pd::Application::ApplicationBase.any_instance.stubs(:deliver_email)
    end

    test 'does not require user or status' do
      application = build :pd_principal_approval_application, user: nil, status: nil, approved: 'Yes'
      assert application.valid?
    end

    test 'does not require answers for school demographic data if application is rejected' do
      application = build :pd_principal_approval_application, approved: 'No'
      assert application.valid?
      application.update_form_data_hash({do_you_approve: 'Yes'})
      refute application.valid?
    end

    test 'do not require anything if placeholder' do
      application = build :pd_principal_approval_application, form_data: {}.to_json
      assert application.valid?
    end

    test 'underrepresented minority percent' do
      application = build :pd_principal_approval_application
      application.update_form_data_hash(
        {
          black: '10',
          hispanic: '15%',

          pacific_islander: '20.5%',
          american_indian: '11.0',
          white: '100000000',

          asian: '100000000',
          other: '100000000'
        }
      )
      assert_equal 56.5, application.underrepresented_minority_percent
    end

    test 'corresponding teacher application is required' do
      principal_application = build :pd_principal_approval_application, teacher_application: nil
      refute principal_application.valid?
      assert_equal ['Teacher application must exist'], principal_application.errors.full_messages

      # fake guid won't work
      principal_application.application_guid = SecureRandom.uuid
      refute principal_application.valid?

      # real teacher application guid is required
      teacher_application = create :pd_teacher_application
      principal_application.application_guid = teacher_application.application_guid
      assert principal_application.valid?
    end

    test 'teacher app status becomes "unreviewed" if previously "awaiting_admin_approval" upon admin submission' do
      teacher_application = create :pd_teacher_application
      teacher_application.update!(status: 'awaiting_admin_approval')

      assert_equal 'awaiting_admin_approval', teacher_application.status
      create :pd_principal_approval_application, teacher_application: teacher_application
      assert_equal 'unreviewed', teacher_application.reload.status
    end

    test 'teacher application status does not change if not "awaiting_admin_approval" upon admin submission' do
      teacher_application = create :pd_teacher_application
      teacher_application.update!(status: 'pending')

      assert_equal 'pending', teacher_application.status
      create :pd_principal_approval_application, teacher_application: teacher_application
      assert_equal 'pending', teacher_application.reload.status
    end

    test 'create placeholder and send mail creates a placeholder and sends principal approval' do
      teacher_application = create :pd_teacher_application

      assert_creates Pd::Application::PrincipalApprovalApplication do
        Pd::Application::PrincipalApprovalApplication.create_placeholder_and_send_mail(teacher_application)
      end

      assert Pd::Application::PrincipalApprovalApplication.last.placeholder?
      assert_equal 1, teacher_application.emails.where.not(sent_at: nil).where(email_type: 'admin_approval').count
    end
  end
end
