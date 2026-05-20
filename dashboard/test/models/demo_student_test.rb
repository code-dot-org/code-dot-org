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

  test 'invalidates Policies::DemoSections cache on commit' do
    student = create(:student)
    Policies::DemoSections.all_demo_student_ids # warm cache
    DemoStudent.create!(user: student, demo_type: 'high')

    assert_includes Policies::DemoSections.all_demo_student_ids, student.id
  end

  test 'invalidates Policies::DemoSections cache on destroy' do
    student = create(:student)
    record = DemoStudent.create!(user: student, demo_type: 'high')
    Policies::DemoSections.all_demo_student_ids # warm cache (now contains student)
    record.destroy!

    refute_includes Policies::DemoSections.all_demo_student_ids, student.id
  end
end
