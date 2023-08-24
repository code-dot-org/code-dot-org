require 'test_helper'

class GoogleClassroomSectionTest < ActiveSupport::TestCase
  test 'from google classroom service without family name import' do
    DCDO.stubs(:get).with('google_classroom_family_name', false).returns(false)
    DCDO.stubs(:get).with(I18nStringUrlTracker::I18N_STRING_TRACKING_DCDO_KEY, false).returns(false)

    owner = create :teacher
    student_list = Google::Apis::ClassroomV1::ListStudentsResponse.from_json(
      {
        students: (1..50).map do |i|
          {
            userId: i,
            profile: {
              name: {
                fullName: "Sample User #{i}",
                givenName: "Sample",
                familyName: "User #{i}"
              }
            }
          }
        end
      }.to_json
    ).students

    section = GoogleClassroomSection.from_service('101', owner.id, student_list, 'Test Section A')
    assert section.provider_managed?
    assert_equal 'G-101', section.code
    assert_equal 'Test Section A', section.name
    section.students.reload
    assert_equal 50, section.students.length
    assert_equal 'Sample User 1', section.students.first.name
    assert_nil section.students.first.family_name

    assert_no_difference 'User.count' do
      # Should find the existing Google Classroom section.
      section_2 = GoogleClassroomSection.from_service('101', owner.id, student_list, 'Test Section B')
      assert_equal section.id, section_2.id

      # Should update the name to match the imported name.
      assert_equal 'Test Section B', section_2.name
    end
    DCDO.unstub(:get)
  end

  test 'from google classroom service with family name import' do
    DCDO.stubs(:get).with('google_classroom_family_name', false).returns(true)
    DCDO.stubs(:get).with(I18nStringUrlTracker::I18N_STRING_TRACKING_DCDO_KEY, false).returns(false)

    owner = create :teacher
    student_list = Google::Apis::ClassroomV1::ListStudentsResponse.from_json(
      {
        students: (1..50).map do |i|
          {
            userId: i,
            profile: {
              name: {
                fullName: "Sample User #{i}",
                givenName: "Sample",
                familyName: "User #{i}"
              }
            }
          }
        end
      }.to_json
    ).students

    section = GoogleClassroomSection.from_service('101', owner.id, student_list, 'Test Section A')
    assert section.provider_managed?
    assert_equal 'G-101', section.code
    assert_equal 'Test Section A', section.name
    section.students.reload
    assert_equal 50, section.students.length
    assert_equal 'Sample', section.students.first.name
    assert_equal 'User 1', section.students.first.family_name

    assert_no_difference 'User.count' do
      # Should find the existing Google Classroom section.
      section_2 = GoogleClassroomSection.from_service('101', owner.id, student_list, 'Test Section B')
      assert_equal section.id, section_2.id

      # Should update the name to match the imported name.
      assert_equal 'Test Section B', section_2.name
    end
    DCDO.unstub(:get)
  end

  test 'strips emoji from section name' do
    owner = create :teacher
    section = GoogleClassroomSection.from_service(
      '101',
      owner.id,
      [],
      "\u{1F600} Test Section A \u{1F600}"
    )
    assert_equal 'Test Section A', section.name
  end
end
