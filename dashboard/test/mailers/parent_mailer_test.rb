require 'test_helper'

class ParentMailerTest < ActionMailer::TestCase
  test 'student associated with parent email' do
    student = create :user
    parent_email = 'arthur.weasley@ministryofmagic.wiz.uk'
    mail = ParentMailer.student_associated_with_parent_email(parent_email, student)

    assert_equal I18n.t('parent_mailer.student_associated_subject'), mail.subject
    assert_equal [parent_email], mail.to
    assert_equal ['hadi_partovi@code.org'], mail.from
    assert links_are_complete_urls?(mail)
  end

  test 'parent email added to student account' do
    student = create :user
    parent_email = 'molly.weasley@ministryofmagic.wiz.uk'
    mail = ParentMailer.parent_email_added_to_student_account(parent_email, student)

    assert_equal I18n.t('parent_mailer.parent_email_added_subject'), mail.subject
    assert_equal [parent_email], mail.to
    assert_equal ['hadi_partovi@code.org'], mail.from
    assert links_are_complete_urls?(mail)
  end
end
