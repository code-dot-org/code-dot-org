require 'test_helper'

class Queries::ChildAccountTest < ActiveSupport::TestCase
  freeze_time

  test 'expired_accounts' do
    expired_accounts = Array.new(3) {|_| create :locked_out_child, :expired}
    locked_account = create :locked_out_child
    u13_colorado_account = create :student, :U13, :in_colorado
    student_account = create :student
    users = [locked_account, u13_colorado_account, student_account,
             *expired_accounts]
    user_ids = users.map(&:id)

    actual_expired_accounts = Queries::ChildAccount.expired_accounts(scope: User.where(id: user_ids))

    expired_accounts.each do |expected_user|
      assert_includes(actual_expired_accounts, expected_user)
    end
    assert_equal expired_accounts.count, actual_expired_accounts.count
  end

  test "finds student state by indirectly using school state" do
    school_info = create :school_info, state: 'WA'
    teacher = create :teacher, :with_school_info, school_info: school_info
    section = create :section, user: teacher
    student = create(:follower, section: section).student_user

    assert_equal 'WA', Queries::ChildAccount.teacher_us_state(student)
  end

  test "returns nil when finding student state from teacher state when the student has no sections" do
    student = create :student
    assert_nil Queries::ChildAccount.teacher_us_state(student)
  end

  test "returns nil when finding student state from teacher state when teacher has no school" do
    teacher = create :teacher
    section = create :section, user: teacher
    student = create(:follower, section: section).student_user

    assert_nil Queries::ChildAccount.teacher_us_state(student)
  end

  test "when finding student state from teacher state, finds the most recent section" do
    school_info = create :school_info, state: 'WA'
    teacher = create :teacher, :with_school_info, school_info: school_info
    school_info_old = create :school_info, state: 'CO'
    teacher_old = create :teacher, :with_school_info, school_info: school_info_old

    section = create :section, user: teacher
    section_old = create :section, created_at: 1.year.ago, user: teacher_old
    student = create(:follower, section: section).student_user
    create :follower, section: section_old, student_user: student

    assert_equal 'WA', Queries::ChildAccount.teacher_us_state(student)
  end

  test "when finding student state from teacher state, finds the most recent school" do
    school_info_old = create :school_info, state: 'CO'
    school_info_new = create :school_info, state: 'WA'
    teacher = create :teacher, :with_school_info, school_info: school_info_new
    create :user_school_info, user: teacher, school_info: school_info_old, start_date: 1.year.ago
    section = create :section, user: teacher
    student = create(:follower, section: section).student_user

    assert_equal 'WA', Queries::ChildAccount.teacher_us_state(student)
  end
end
