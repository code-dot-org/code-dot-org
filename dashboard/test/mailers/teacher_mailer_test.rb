require 'test_helper'

class TeacherMailerTest < ActionMailer::TestCase
  test 'new teacher email for en-US locale' do
    # Teacher with en-US locale will get the en-US version of the welcome email.
    teacher = build :teacher, email: 'minerva@hogwarts.co.uk'
    mail = TeacherMailer.new_teacher_email(teacher, 'en-US')

    assert_equal I18n.t('teacher_mailer.new_teacher_subject', locale: 'en-US'), mail.subject
    assert_equal [teacher.email], mail.to
    assert_equal ['hadi_partovi@code.org'], mail.from
    assert_match /Hello/, mail.body.encoded
    assert links_are_complete_urls?(mail)
  end

  test 'new teacher email for es-MX locale' do
    # Teacher with es-MX locale will get the es-MX version of the welcome email.
    teacher = build :teacher, email: 'teacher@gmail.com'
    mail = TeacherMailer.new_teacher_email(teacher, 'es-MX')
    assert_equal I18n.t('teacher_mailer.new_teacher_subject', locale: 'es-MX'), mail.subject
    assert_match /Hola/, mail.body.encoded
  end

  test 'new teacher email for non en-US, non es-MX locale' do
    # Teacher with non en-US and non es-MX locale will get the
    # standard en-US version of the welcome email.
    teacher = build :teacher, email: 'teacher@gmail.com'
    mail = TeacherMailer.new_teacher_email(teacher, 'it-IT')
    assert_equal I18n.t('teacher_mailer.new_teacher_subject', locale: 'en-US'), mail.subject
    assert_match /Hello/, mail.body.encoded
  end

  test 'delete teacher email' do
    teacher = create :teacher, email: 'mickey@mouse.com', name: 'Mickey Mouse'
    removed_students = create_list :student, 2
    mail = TeacherMailer.delete_teacher_email(teacher, removed_students)

    assert_equal I18n.t('teacher_mailer.delete_teacher_subject'), mail.subject
    assert_equal [teacher.email], mail.to
    assert_equal ['noreply@code.org'], mail.from
    assert_match 'Your account has been deleted', mail.body.encoded
    assert_match 'Student accounts deleted:', mail.body.encoded
    assert_match "#{removed_students.first.name} (#{removed_students.first.username})", mail.body.encoded
    assert_match "#{removed_students.last.name} (#{removed_students.last.username})", mail.body.encoded
  end

  test 'delete teacher email with more than 1000 students' do
    teacher = create :teacher, email: 'mickey@mouse.com', name: 'Mickey Mouse'
    removed_students = create_list :student, 2
    # Cheat to keep this test from taking 30+ seconds to run
    removed_students.stubs(:count).returns(1001).twice
    mail = TeacherMailer.delete_teacher_email(teacher, removed_students)

    assert_equal I18n.t('teacher_mailer.delete_teacher_subject'), mail.subject
    assert_equal [teacher.email], mail.to
    assert_equal ['noreply@code.org'], mail.from
    assert_match 'Your account has been deleted', mail.body.encoded
    assert_match '1001 student accounts were deleted.', mail.body.encoded
    refute_match "#{removed_students.first.name} (#{removed_students.first.username})", mail.body.encoded
  end
end
