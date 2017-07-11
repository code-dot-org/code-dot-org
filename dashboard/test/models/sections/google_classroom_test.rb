require 'test_helper'

class SectionTest < ActiveSupport::TestCase
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

    section = Section.from_omniauth('G-222', Section::LOGIN_TYPE_GOOGLE_CLASSROOM, students, owner.id)
    assert_equal 'G-222', section.code

    assert_no_difference 'User.count' do
      # Should find the existing Google Classroom section.
      section_2 = Section.from_omniauth('G-222', Section::LOGIN_TYPE_GOOGLE_CLASSROOM, students, owner.id)
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
      section_3 = Section.from_omniauth('G-222', Section::LOGIN_TYPE_GOOGLE_CLASSROOM, students, owner.id)
      assert_equal section.id, section_3.id
    end
  end
end
