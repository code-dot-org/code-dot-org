require 'test_helper'

class FollowerMailerTest < ActionMailer::TestCase
  test 'student disassociated notify teacher' do
    teacher = build :teacher
    student = build :user
    mail = FollowerMailer.student_disassociated_notify_teacher(teacher, student)

    assert_equal I18n.t('follower.mail.student_disassociated.subject', student_name: student.name), mail.subject
    assert_equal [teacher.email], mail.to
    assert_equal ['noreply@code.org'], mail.from
    assert links_are_complete_urls?(mail)
  end
end
