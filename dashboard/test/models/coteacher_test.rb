require 'test_helper'

class CoteacherTest < ActiveSupport::TestCase
  test "user must be teacher" do
    teacher = create(:teacher)
    student = create(:student)

    teacher_section = Section.create(users: [teacher], name: "a section")
    assert teacher_section.persisted?

    student_section = Section.create(users: [student], name: "a section")

    assert !student_section.persisted?
    assert_equal ["User must be a teacher"], student_section.coteachers.first.errors.full_messages
  end

  test "user must be present" do
    section = create(:section)
    coteacher = Coteacher.create(section: section)

    assert_includes coteacher.errors.full_messages, "User is required"
  end

  test "section must be present" do
    teacher = create(:teacher)
    coteacher = Coteacher.create(user: teacher)

    assert_includes coteacher.errors.full_messages, "Section is required"
  end
end
