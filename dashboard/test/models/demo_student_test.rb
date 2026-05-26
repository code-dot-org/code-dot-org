require 'test_helper'

class DemoStudentTest < ActiveSupport::TestCase
  # Validations

  test 'is valid with a student user in an allowed section and a known demo_type' do
    record = DemoStudent.new(user: create(:student, :in_email_section), demo_type: 'high')

    assert record.valid?
  end

  test 'is invalid when the linked user is a teacher' do
    record = DemoStudent.new(user: create(:teacher), demo_type: 'high')

    refute record.valid?
    assert_includes record.errors[:user], 'must be a student'
  end

  test 'is invalid for an unknown demo_type' do
    record = DemoStudent.new(user: create(:student, :in_email_section), demo_type: 'kindergarten')

    refute record.valid?
    assert_includes record.errors[:demo_type], 'is not included in the list'
  end

  test 'is invalid without a user' do
    record = DemoStudent.new(demo_type: 'high')

    refute record.valid?
    assert_includes record.errors[:user], 'must exist'
  end

  test 'is invalid for a duplicate (user, demo_type) pair' do
    student = create(:student, :in_email_section)
    DemoStudent.create!(user: student, demo_type: 'high')
    duplicate = DemoStudent.new(user: student, demo_type: 'high')

    refute duplicate.valid?
  end

  test 'permits the same user across different demo_types' do
    student = create(:student, :in_email_section)
    DemoStudent.create!(user: student, demo_type: 'high')
    other_type = DemoStudent.new(user: student, demo_type: 'middle')

    assert other_type.valid?
  end

  # user_must_be_lockable: refuses to flag a student we can't lock out of all
  # their existing sections. Validation runs on :create only; sections can
  # change later without re-triggering the check.

  test 'is invalid when student has no sections' do
    record = DemoStudent.new(user: create(:student), demo_type: 'high')

    refute record.valid?
    assert(record.errors[:user].any? {|m| m.include?('email/word/picture sections')})
  end

  test 'is invalid when student is in a non-allowed (OAuth) section' do
    student = create(:student)
    google_section = create(:section, login_type: Section::LOGIN_TYPE_GOOGLE_CLASSROOM)
    create(:follower, student_user: student, section: google_section)
    record = DemoStudent.new(user: student, demo_type: 'high')

    refute record.valid?
    assert(record.errors[:user].any? {|m| m.include?('email/word/picture sections')})
  end

  test 'is invalid when student is in a mix of allowed and disallowed sections' do
    student = create(:student, :in_email_section)
    google_section = create(:section, login_type: Section::LOGIN_TYPE_GOOGLE_CLASSROOM)
    create(:follower, student_user: student, section: google_section)
    record = DemoStudent.new(user: student, demo_type: 'high')

    refute record.valid?
    assert(record.errors[:user].any? {|m| m.include?('email/word/picture sections')})
  end

  test 'lockable validation only runs on :create, not on update' do
    student = create(:student, :in_email_section)
    record = DemoStudent.create!(user: student, demo_type: 'high')
    # Adding a non-allowed section afterward must not invalidate the record.
    google_section = create(:section, login_type: Section::LOGIN_TYPE_GOOGLE_CLASSROOM)
    create(:follower, student_user: student, section: google_section)

    assert record.valid?
  end

  # after_create :lock_user_login!: runs inside the create transaction, so a
  # failure rolls back the demo_students insert and leaves the user with
  # credentials intact.

  test 'create clears credentials for a student in an email section' do
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

    DemoStudent.create!(user: student, demo_type: 'high')
    student.reload

    assert_nil student.secret_words
    assert_nil student.secret_picture_id
    assert_equal '', student.encrypted_password
    assert_equal '', student.hashed_email
    assert_equal '', student.read_attribute(:email)
    assert_nil student.provider
    assert_nil student.uid
    assert_equal 0, student.authentication_options.with_deleted.count
  end

  test 'create works for a word section student' do
    word_student = create(:student_in_word_section)

    DemoStudent.create!(user: word_student, demo_type: 'middle')

    assert_equal '', word_student.reload.encrypted_password
  end

  test 'create works for a picture section student' do
    picture_student = create(:student_in_picture_section)

    DemoStudent.create!(user: picture_student, demo_type: 'elementary')

    assert_equal '', picture_student.reload.encrypted_password
  end

  test 'create hard-deletes authentication_options rather than soft-deleting' do
    student = create(:student, :in_email_section)
    auth = create(:authentication_option, user: student)

    DemoStudent.create!(user: student, demo_type: 'high')

    refute AuthenticationOption.with_deleted.exists?(auth.id)
  end

  test 'create rolls back the demo_students insert when lockdown fails' do
    student = create(:student, :in_email_section, encrypted_password: 'pw')
    boom = RuntimeError.new('lockdown blew up')
    User.any_instance.stubs(:update!).raises(boom)

    assert_raises(RuntimeError) do
      DemoStudent.create!(user: student, demo_type: 'high')
    end
    refute DemoStudent.exists?(user_id: student.id)
    assert_equal 'pw', student.reload.encrypted_password
  end

  # after_commit :reset_policy_cache: transactional tests roll back, so the
  # real :commit hook never fires unless invoked explicitly.

  test 'after_commit hook clears Policies::DemoSections cache' do
    student = create(:student, :in_email_section)
    record = DemoStudent.new(user: student, demo_type: 'high')
    Policies::DemoSections.all_demo_student_ids # warm cache (does not include student)

    record.save!
    record.run_callbacks(:commit)

    assert_includes Policies::DemoSections.all_demo_student_ids, student.id
  end

  test 'after_commit hook clears Policies::DemoSections cache on destroy' do
    student = create(:student, :in_email_section)
    record = DemoStudent.create!(user: student, demo_type: 'high')
    record.run_callbacks(:commit) # ensure post-create cache is fresh
    Policies::DemoSections.all_demo_student_ids # warm cache (includes student)

    record.destroy!
    record.run_callbacks(:commit)

    refute_includes Policies::DemoSections.all_demo_student_ids, student.id
  end

  # Demo students are protected from hard-delete and purge so the
  # demo_students row persists and permission checks keep working for
  # archived (soft-deleted) users. Protection uses the uncached durable
  # check, so a stale per-process cache cannot bypass it.

  test 'User#really_destroy! raises ProtectedRecord for a demo student' do
    student = create(:student, :in_email_section)
    DemoStudent.create!(user: student, demo_type: 'high')
    Policies::DemoSections.reset_cache!

    assert_raises(DemoStudent::ProtectedRecord) {student.really_destroy!}
    assert User.with_deleted.exists?(student.id)
    assert Policies::DemoSections.demo_student?(student.id)
  end

  test 'User#really_destroy! still works for a non-demo student' do
    student = create(:student)

    assert_nothing_raised {student.really_destroy!}
    refute User.with_deleted.exists?(student.id)
  end

  test 'User#really_destroy! protection survives a stale per-process cache' do
    student = create(:student, :in_email_section)
    DemoStudent.create!(user: student, demo_type: 'high')
    # Force the in-process cache empty so cached demo_student? returns false.
    Policies::DemoSections.instance_variable_set(:@all_demo_student_ids, Set.new)

    refute Policies::DemoSections.demo_student?(student.id)
    assert Policies::DemoSections.demo_student_durable?(student.id)
    assert_raises(DemoStudent::ProtectedRecord) {student.really_destroy!}
  end

  test 'foreign key prevents raw-SQL deletion of a demo student user' do
    student = create(:student, :in_email_section)
    DemoStudent.create!(user: student, demo_type: 'high')

    assert_raises(ActiveRecord::InvalidForeignKey) do
      User.connection.execute("DELETE FROM users WHERE id = #{student.id.to_i}")
    end
    assert User.exists?(student.id)
  end

  test 'User#destroy soft-deletes a demo student and demo_student? stays true' do
    student = create(:student, :in_email_section)
    DemoStudent.create!(user: student, demo_type: 'high')
    Policies::DemoSections.reset_cache!

    student.destroy

    assert student.reload.deleted_at.present?
    assert DemoStudent.exists?(user_id: student.id)
    assert Policies::DemoSections.demo_student?(student.id)
  end

  test 'User#clear_user_and_mark_purged raises ProtectedRecord for a demo student' do
    student = create(:student, :in_email_section)
    DemoStudent.create!(user: student, demo_type: 'high')
    Policies::DemoSections.reset_cache!

    assert_raises(DemoStudent::ProtectedRecord) {student.clear_user_and_mark_purged}
    assert_nil student.reload.purged_at
  end

  test 'User#clear_user_and_mark_purged protection survives a stale per-process cache' do
    student = create(:student, :in_email_section)
    DemoStudent.create!(user: student, demo_type: 'high')
    Policies::DemoSections.instance_variable_set(:@all_demo_student_ids, Set.new)

    refute Policies::DemoSections.demo_student?(student.id)
    assert_raises(DemoStudent::ProtectedRecord) {student.clear_user_and_mark_purged}
    assert_nil student.reload.purged_at
  end
end
