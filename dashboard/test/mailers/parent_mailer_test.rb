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
end
