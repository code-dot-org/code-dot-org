require 'test_helper'

class ParentMailerTest < ActionMailer::TestCase
  test 'student associated with parent email' do
    student = create :user
    parent_email = 'arthur.weasley@ministryofmagic.wiz.uk'
    mail = ParentMailer.student_associated_with_parent_email(parent_email, student)

    assert_equal I18n.t('parent_mailer.student_associated_subject'), mail.subject
    assert_equal [parent_email], mail.to
    assert_equal ['hadi_partovi@code.org'], mail.from
    assert_equal ['support@code.org'], mail.reply_to
    assert links_are_complete_urls?(mail)
  end

  test 'parent email added to student account' do
    student = create :user
    parent_email = 'molly.weasley@ministryofmagic.wiz.uk'
    mail = ParentMailer.parent_email_added_to_student_account(parent_email, student)

    assert_equal I18n.t('parent_mailer.parent_email_added_subject'), mail.subject
    assert_equal [parent_email], mail.to
    assert_equal ['hadi_partovi@code.org'], mail.from
    assert_equal ['support@code.org'], mail.reply_to
    assert links_are_complete_urls?(mail)
  end

  test 'parent permission request' do
    parent_email = 'parent@test.com'
    permission_url = 'https://api.code.org/permission/foo'
    mail = ParentMailer.parent_permission_request(parent_email, permission_url)

    assert_equal I18n.t('parent_mailer.parent_permission_request_subject'), mail.subject
    assert_equal [parent_email], mail.to
    assert_equal ['noreply@code.org'], mail.from
    assert_equal ['support@code.org'], mail.reply_to
    assert links_are_complete_urls?(mail)
  end

  test 'parent permission reminder' do
    parent_email = 'parent@test.com'
    permission_url = 'https://api.code.org/permission/foo'
    mail = ParentMailer.parent_permission_reminder(parent_email, permission_url)

    assert_equal I18n.t('parent_mailer.parent_permission_reminder_subject'), mail.subject
    assert_equal [parent_email], mail.to
    assert_equal ['noreply@code.org'], mail.from
    assert_equal ['support@code.org'], mail.reply_to
    assert links_are_complete_urls?(mail)
  end

  test 'parent permission confirmation' do
    parent_email = 'parent@test.com'
    mail = ParentMailer.parent_permission_confirmation(parent_email)

    assert_equal I18n.t('parent_mailer.parent_permission_confirmation_subject'), mail.subject
    assert_equal [parent_email], mail.to
    assert_equal ['noreply@code.org'], mail.from
    assert_equal ['support@code.org'], mail.reply_to
    assert links_are_complete_urls?(mail)
  end
end
