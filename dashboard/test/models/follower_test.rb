require 'test_helper'

class FollowerTest < ActiveSupport::TestCase
  setup do
    # TODO put this in test_helper
    @laurel = create(:teacher)
    @laurel_section_1 = create(:section, user: @laurel)
    @laurel_section_2 = create(:section, user: @laurel)

    # add a few students to a section
    create(:follower, section: @laurel_section_1)
    create(:follower, section: @laurel_section_1)

    @chris = create(:teacher)
    @chris_section = create(:section, user: @chris)

    # student without section or teacher
    @student = create(:user)
  end

  test "cannot follow yourself" do
    follower = Follower.create(user_id: @laurel.id, student_user_id: @laurel.id, section: @laurel_section_1)
    assert !follower.valid?
  end
end
