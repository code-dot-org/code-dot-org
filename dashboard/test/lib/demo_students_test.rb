require 'test_helper'
require 'demo_students'

class DemoStudentsTest < ActiveSupport::TestCase
  test 'prevent_demo_student_login clears credentials for a student in an email section' do
    student = create(:student, :in_email_section, encrypted_password: 'pw', hashed_email: 'h')
    create(:authentication_option, user: student)

    assert DemoStudents.prevent_demo_student_login(student.id, 'high')
    student.reload

    assert_nil student.secret_words
    assert_nil student.secret_picture_id
    assert_equal '', student.encrypted_password
    assert_equal '', student.hashed_email
    assert_equal 0, student.authentication_options.count
  end

  test 'prevent_demo_student_login works for a word section student' do
    word_student = create(:student_in_word_section)

    assert DemoStudents.prevent_demo_student_login(word_student.id, 'middle')

    assert_equal '', word_student.reload.encrypted_password
  end

  test 'prevent_demo_student_login works for a picture section student' do
    picture_student = create(:student_in_picture_section)

    assert DemoStudents.prevent_demo_student_login(picture_student.id, 'elementary')

    assert_equal '', picture_student.reload.encrypted_password
  end

  test 'prevent_demo_student_login is idempotent' do
    student = create(:student, :in_email_section)

    DemoStudents.prevent_demo_student_login(student.id, 'high')
    Honeybadger.expects(:notify).never
    DemoStudents.prevent_demo_student_login(student.id, 'high')
  end

  test 'prevent_demo_student_login notifies and returns false when user is not found' do
    Honeybadger.expects(:notify).with(
      'Demo student id not found',
      has_entries(context: has_entries(user_id: 9_999_999)),
    )

    refute DemoStudents.prevent_demo_student_login(9_999_999, 'high')
  end

  test 'prevent_demo_student_login notifies and returns false when user is not a student' do
    teacher = create(:teacher, encrypted_password: 'pw')
    Honeybadger.expects(:notify).with(
      'Demo student id is not a student',
      has_entries(context: has_entries(user_id: teacher.id)),
    )

    refute DemoStudents.prevent_demo_student_login(teacher.id, 'high')

    assert_equal 'pw', teacher.reload.encrypted_password
  end

  test 'prevent_demo_student_login notifies and returns false when student is not in an email/word/picture section' do
    student = create(:student, encrypted_password: 'pw')
    google_section = create(:section, login_type: Section::LOGIN_TYPE_GOOGLE_CLASSROOM)
    create(:follower, student_user: student, section: google_section)
    Honeybadger.expects(:notify).with(
      'Demo student is not in any email/word/picture section',
      has_entries(context: has_entries(user_id: student.id)),
    )

    refute DemoStudents.prevent_demo_student_login(student.id, 'high')

    assert_equal 'pw', student.reload.encrypted_password
  end

  test 'prevent_demo_student_logins is a no-op when no DemoStudent rows exist' do
    Honeybadger.expects(:notify).never

    DemoStudents.prevent_demo_student_logins
  end

  test 'prevent_demo_student_logins locks every DemoStudent row' do
    high_student = create(:student, :in_email_section, encrypted_password: 'pw')
    middle_student = create(:student_in_word_section, encrypted_password: 'pw')
    DemoStudent.create!(user: high_student, demo_type: 'high')
    DemoStudent.create!(user: middle_student, demo_type: 'middle')

    DemoStudents.prevent_demo_student_logins

    assert_equal '', high_student.reload.encrypted_password
    assert_equal '', middle_student.reload.encrypted_password
  end
end
