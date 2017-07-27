require 'test_helper'

class OmniAuthSectionTest < ActiveSupport::TestCase
  test 'from omniauth' do
    owner = create :teacher
    students = [
      OmniAuth::AuthHash.new(
        uid: 111,
        provider: 'google_oauth2',
        info: {
          name: 'Sample User',
        },
      )
    ]

    section = OmniAuthSection.from_omniauth(
      code: 'G-222222',
      type: Section::LOGIN_TYPE_GOOGLE_CLASSROOM,
      owner_id: owner.id,
      students: students,
    )
    section.reload
    assert_equal 'G-222222', section.code
    assert_equal User.from_omniauth(students.first, {}), section.students.first

    assert_no_difference 'User.count' do
      # Should find the existing Google Classroom section.
      section_2 = OmniAuthSection.from_omniauth(
        code: 'G-222222',
        type: Section::LOGIN_TYPE_GOOGLE_CLASSROOM,
        owner_id: owner.id,
        students: students,
      )
      assert_equal section.id, section_2.id
    end

    students << OmniAuth::AuthHash.new(
      uid: 333,
      provider: 'google_oauth2',
      info: {
        name: 'Added Student',
      },
    )
    assert_difference 'User.count', 1 do
      # Should add 1 student to the existing Google Classroom section.
      section_3 = OmniAuthSection.from_omniauth(
        code: 'G-222222',
        type: Section::LOGIN_TYPE_GOOGLE_CLASSROOM,
        owner_id: owner.id,
        students: students,
      )
      assert_equal section.id, section_3.id
    end
  end

  test 'set exact student list' do
    teacher = create :teacher
    section = create :section, user: teacher, login_type: 'clever'

    students = (0...5).map do
      create :student
    end

    section.set_exact_student_list(students)
    assert_equal students.pluck(:id), section.reload.students.pluck(:id)

    added_students = (0...5).map do
      create :student
    end
    updated_students = students[1...3] + added_students

    section.set_exact_student_list(updated_students)
    assert_equal updated_students.pluck(:id), section.reload.students.pluck(:id).sort
  end
end
