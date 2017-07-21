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

  test 'cannot add students to omniauth section' do
    owner = create :teacher
    student = create :student

    section = OmniAuthSection.from_omniauth(
      code: 'ZZZ',
      type: Section::LOGIN_TYPE_CLEVER,
      owner_id: owner.id,
      students: [],
    )

    assert_raise do
      section.add_student student
    end
  end
end
