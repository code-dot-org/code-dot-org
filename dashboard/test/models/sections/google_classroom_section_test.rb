require 'test_helper'

class GoogleClassroomSectionTest < ActiveSupport::TestCase
  test 'from google classroom service' do
    owner = create :teacher
    student_list = Google::Apis::ClassroomV1::ListStudentsResponse.from_json(
      {
        students: (1..50).map do |i|
          {userId: i, profile: {name: {fullName: "Sample User #{i}"}}}
        end
      }.to_json
    ).students

    section = GoogleClassroomSection.from_service('101', owner.id, student_list)
    assert section.provider_managed?
    assert_equal 'G-101', section.code
    assert_equal 50, section.students.count

    assert_no_difference 'User.count' do
      # Should find the existing Google Classroom section.
      section_2 = GoogleClassroomSection.from_service('101', owner.id, student_list)
      assert_equal section.id, section_2.id
    end
  end
end
