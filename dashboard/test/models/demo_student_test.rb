require 'test_helper'

class DemoStudentTest < ActiveSupport::TestCase
  # Validations

  test 'is valid with a student user and a known demo_type' do
    record = DemoStudent.new(user: create(:student), demo_type: 'high')

    assert record.valid?
  end

  test 'is invalid when the linked user is a teacher' do
    record = DemoStudent.new(user: create(:teacher), demo_type: 'high')

    refute record.valid?
    assert_includes record.errors[:user], 'must be a student'
  end

  test 'is invalid for an unknown demo_type' do
    record = DemoStudent.new(user: create(:student), demo_type: 'kindergarten')

    refute record.valid?
    assert_includes record.errors[:demo_type], 'is not included in the list'
  end

  test 'is invalid without a user' do
    record = DemoStudent.new(demo_type: 'high')

    refute record.valid?
    assert_includes record.errors[:user], 'must exist'
  end

  test 'is invalid for a duplicate (user, demo_type) pair' do
    student = create(:student)
    DemoStudent.create!(user: student, demo_type: 'high')
    duplicate = DemoStudent.new(user: student, demo_type: 'high')

    refute duplicate.valid?
  end

  test 'permits the same user across different demo_types' do
    student = create(:student)
    DemoStudent.create!(user: student, demo_type: 'high')
    other_type = DemoStudent.new(user: student, demo_type: 'middle')

    assert other_type.valid?
  end

  # Tests below exercise the after_commit hooks by invoking the callbacks
  # directly. Transactional tests roll back, so real :commit hooks never
  # fire on their own here.

  # after_commit :reset_policy_cache

  test 'after_commit hook clears Policies::DemoSections cache' do
    student = create(:student)
    record = DemoStudent.new(user: student, demo_type: 'high')
    Policies::DemoSections.all_demo_student_ids # warm cache (does not include student)

    record.save!
    record.run_callbacks(:commit)

    assert_includes Policies::DemoSections.all_demo_student_ids, student.id
  end

  test 'after_commit hook clears Policies::DemoSections cache on destroy' do
    student = create(:student)
    record = DemoStudent.create!(user: student, demo_type: 'high')
    record.run_callbacks(:commit) # ensure post-create cache is fresh
    Policies::DemoSections.all_demo_student_ids # warm cache (includes student)

    record.destroy!
    record.run_callbacks(:commit)

    refute_includes Policies::DemoSections.all_demo_student_ids, student.id
  end

  # after_create_commit :lock_user_login!

  test 'lock_user_login! clears credentials for a student in an email section' do
    student = create(
      :student,
      :in_email_section,
      encrypted_password: 'pw',
      hashed_email: 'h',
      email: 'student@example.com',
      provider: 'google_oauth2',
      uid: 'legacy-uid',
    )
    create(:authentication_option, user: student)
    record = DemoStudent.create!(user: student, demo_type: 'high')

    record.run_callbacks(:commit)
    student.reload

    assert_nil student.secret_words
    assert_nil student.secret_picture_id
    assert_equal '', student.encrypted_password
    assert_equal '', student.hashed_email
    assert_equal '', student.read_attribute(:email)
    assert_nil student.provider
    assert_nil student.uid
    assert_equal 0, student.authentication_options.count
  end

  test 'lock_user_login! works for a word section student' do
    word_student = create(:student_in_word_section)
    record = DemoStudent.create!(user: word_student, demo_type: 'middle')

    record.run_callbacks(:commit)

    assert_equal '', word_student.reload.encrypted_password
  end

  test 'lock_user_login! works for a picture section student' do
    picture_student = create(:student_in_picture_section)
    record = DemoStudent.create!(user: picture_student, demo_type: 'elementary')

    record.run_callbacks(:commit)

    assert_equal '', picture_student.reload.encrypted_password
  end

  test 'lock_user_login! is idempotent' do
    student = create(:student, :in_email_section)
    record = DemoStudent.create!(user: student, demo_type: 'high')
    record.run_callbacks(:commit)

    Honeybadger.expects(:notify).never
    record.send(:lock_user_login!)
  end

  test 'lock_user_login! notifies and skips when student is only in a non-allowed section' do
    student = create(:student, encrypted_password: 'pw')
    google_section = create(:section, login_type: Section::LOGIN_TYPE_GOOGLE_CLASSROOM)
    create(:follower, student_user: student, section: google_section)
    record = DemoStudent.create!(user: student, demo_type: 'high')

    Honeybadger.expects(:notify).with(
      'Demo student is not exclusively in email/word/picture sections',
      has_entries(context: has_entries(user_id: student.id)),
    )

    record.run_callbacks(:commit)
    assert_equal 'pw', student.reload.encrypted_password
  end

  test 'lock_user_login! notifies and skips when student has no sections' do
    student = create(:student, encrypted_password: 'pw')
    record = DemoStudent.create!(user: student, demo_type: 'high')

    Honeybadger.expects(:notify).with(
      'Demo student is not exclusively in email/word/picture sections',
      has_entries(context: has_entries(user_id: student.id, section_login_types: [])),
    )

    record.run_callbacks(:commit)
    assert_equal 'pw', student.reload.encrypted_password
  end

  test 'lock_user_login! notifies and skips when student is in a mix of allowed and disallowed sections' do
    student = create(:student, :in_email_section, encrypted_password: 'pw')
    google_section = create(:section, login_type: Section::LOGIN_TYPE_GOOGLE_CLASSROOM)
    create(:follower, student_user: student, section: google_section)
    record = DemoStudent.create!(user: student, demo_type: 'high')

    Honeybadger.expects(:notify).with(
      'Demo student is not exclusively in email/word/picture sections',
      has_entries(context: has_entries(user_id: student.id)),
    )

    record.run_callbacks(:commit)
    assert_equal 'pw', student.reload.encrypted_password
  end

  test 'lock_user_login! reports lockdown failures to Honeybadger instead of raising' do
    student = create(:student, :in_email_section, encrypted_password: 'pw')
    record = DemoStudent.create!(user: student, demo_type: 'high')

    boom = RuntimeError.new('lockdown blew up')
    User.any_instance.stubs(:update!).raises(boom)
    Honeybadger.expects(:notify).with(boom, has_entries(context: has_entries(user_id: student.id)))

    assert_nothing_raised {record.run_callbacks(:commit)}
  end
end
