require 'test_helper'

class CleverSectionTest < ActiveSupport::TestCase
  test 'from clever service' do
    owner = create :teacher
    student_list = [
      {'data' => {'dob' => '2002-09-04T00:00:00.000Z', 'name' => {'first' => 'Ethan', 'last' => 'Doe'}, 'id' => '5966ed736b21538e3c000004'}},
      {'data' => {'dob' => '2000-02-11T00:00:00.000Z', 'name' => {'first' => 'Lily', 'last' => 'Fake'}, 'id' => '5966ed736b21538e3c000005'}},
      {'data' => {'dob' => '2002-05-21T00:00:00.000Z', 'name' => {'first' => 'Elizabeth', 'last' => 'Smith'}, 'id' => '5966ed736b21538e3c000006'}},
    ]

    section = CleverSection.from_service('101', owner.id, student_list)
    assert section.provider_managed?
    assert_equal 'C-101', section.code

    assert_no_difference 'User.count' do
      # Should find the existing Google Classroom section.
      section_2 = CleverSection.from_service('101', owner.id, student_list)
      assert_equal section.id, section_2.id
    end
  end
end
