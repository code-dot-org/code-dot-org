require 'test_helper'

class DemoStudentTest < ActiveSupport::TestCase
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

  # Tests below exercise the after_commit cache-reset hook by invoking the
  # callbacks directly. Transactional tests roll back, so real :commit hooks
  # never fire on their own here.

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

  test 'after_create_commit hook locks the linked user' do
    student = create(:student, :in_email_section, encrypted_password: 'pw')
    record = DemoStudent.new(user: student, demo_type: 'high')

    record.save!
    record.run_callbacks(:commit)

    assert_equal '', student.reload.encrypted_password
  end

  test 'after_create_commit hook reports lockdown failures to Honeybadger instead of raising' do
    student = create(:student, :in_email_section, encrypted_password: 'pw')
    record = DemoStudent.new(user: student, demo_type: 'high')
    record.save!

    boom = RuntimeError.new('lockdown blew up')
    DemoStudents.expects(:prevent_demo_student_login).raises(boom)
    Honeybadger.expects(:notify).with(boom, has_entries(context: has_entries(user_id: student.id)))

    assert_nothing_raised {record.run_callbacks(:commit)}
  end
end
