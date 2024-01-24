require 'test_helper'

class TeacherApplicationMailerTest < ActionMailer::TestCase
  setup do
    @regional_partner = create :regional_partner
    @application_with_partner = create :pd_teacher_application
    @application_with_partner.update!(regional_partner: @regional_partner)
    @application_without_partner = create :pd_teacher_application, regional_partner: nil
  end

  test 'confirmation email sends with regional partner' do
    email = Pd::Application::TeacherApplicationMailer.confirmation(@application_with_partner)
    assert_emails 1 do
      email.deliver_now
    end
    assert email.to.include?(@application_with_partner.user.email)
    assert email.subject.include?(@regional_partner.name)
    assert_equal @regional_partner.contact_email, email['reply-to']
    assert_equal "\"Code.org\" <noreply@code.org>", email['from'].to_s
  end

  test 'confirmation email sends without regional partner' do
    email = Pd::Application::TeacherApplicationMailer.confirmation(@application_without_partner)
    assert_emails 1 do
      email.deliver_now
    end
    assert email.to.include?(@application_without_partner.user.email)
    assert email.subject.include?('We\'ve received your application for Code.org\'s Professional Learning Program!')
    assert_includes email.from, "teacher@code.org"
  end

  test 'admin approval teacher reminder email sends with regional partner' do
    email = Pd::Application::TeacherApplicationMailer.admin_approval_teacher_reminder(@application_with_partner)
    assert_emails 1 do
      email.deliver_now
    end
    assert email.to.include?(@application_with_partner.user.email)
    assert email.subject.include?('REMINDER - Action Needed: Your application needs Administrator/School Leader approval')
    assert_equal @regional_partner.contact_email, email['reply-to']
    assert_equal "\"Code.org\" <noreply@code.org>", email['from'].to_s
  end

  test 'admin approval teacher reminder email sends without regional partner' do
    email = Pd::Application::TeacherApplicationMailer.admin_approval_teacher_reminder(@application_without_partner)
    assert_emails 1 do
      email.deliver_now
    end
    assert email.to.include?(@application_without_partner.user.email)
    assert email.body.include?(@application_without_partner.principal_approval_url)
    assert email.subject.include?('REMINDER - Action Needed: Your application needs Administrator/School Leader approval')
    assert_includes email.from, "teacher@code.org"
  end

  test 'needs admin approval email sends with regional partner' do
    email = Pd::Application::TeacherApplicationMailer.needs_admin_approval(@application_with_partner)
    assert_emails 1 do
      email.deliver_now
    end
    assert email.to.include?(@application_with_partner.user.email)
    assert email.subject.include?('Important: Your Application Requires Administrator/School Leader Approval')
    assert_equal @regional_partner.contact_email, email['reply-to']
    assert_equal "\"Code.org\" <noreply@code.org>", email['from'].to_s
  end

  test 'needs admin approval email sends without regional partner' do
    email = Pd::Application::TeacherApplicationMailer.needs_admin_approval(@application_without_partner)
    assert_emails 1 do
      email.deliver_now
    end
    assert email.to.include?(@application_without_partner.user.email)
    assert email.body.include?(@application_without_partner.principal_approval_url)
    assert email.subject.include?('Important: Your Application Requires Administrator/School Leader Approval')
    assert_includes email.from, "teacher@code.org"
  end

  test 'admin approval email sends' do
    email = Pd::Application::TeacherApplicationMailer.admin_approval(@application_with_partner)
    assert_emails 1 do
      email.deliver_now
    end
    assert email.to.include?(@application_with_partner.principal_email)
  end

  test 'admin approval teacher receipt email sends with regional partner' do
    email = Pd::Application::TeacherApplicationMailer.admin_approval_completed_teacher_receipt(@application_with_partner)
    assert_emails 1 do
      email.deliver_now
    end
    assert email.to.include?(@application_with_partner.user.email)
    assert email.subject.include?('Your Administrator/School Leader has approved your application')
    assert_equal @regional_partner.contact_email, email['reply-to']
    assert_equal "\"Code.org\" <noreply@code.org>", email['from'].to_s
  end

  test 'admin approval teacher receipt email sends without regional partner' do
    email = Pd::Application::TeacherApplicationMailer.admin_approval_completed_teacher_receipt(@application_without_partner)
    assert_emails 1 do
      email.deliver_now
    end
    assert email.to.include?(@application_without_partner.user.email)
    assert email.subject.include?('Your Administrator/School Leader has approved your application')
    assert_includes email.from, "teacher@code.org"
  end

  test 'accepted email sends with regional partner' do
    @application_with_partner.pd_workshop_id = create(:pd_workshop, regional_partner: @regional_partner).id
    email = Pd::Application::TeacherApplicationMailer.accepted(@application_with_partner)
    assert_emails 1 do
      email.deliver_now
    end
    assert email.to.include?(@application_with_partner.user.email)
    assert email.subject.include?('Congratulations from')
    assert_equal @regional_partner.contact_email, email['reply-to']
    assert_equal "\"Code.org\" <noreply@code.org>", email['from'].to_s
  end
end
