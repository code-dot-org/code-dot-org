require 'test_helper'

class FollowerTest < ActiveSupport::TestCase
  setup do
    @laurel = create(:teacher)
    @laurel_section_1 = create(:section, user: @laurel)
    @laurel_section_2 = create(:section, user: @laurel)
  end

  test "cannot follow yourself" do
    follower = Follower.create(
      user_id: @laurel.id,
      student_user_id: @laurel.id,
      section: @laurel_section_1
    )
    refute follower.valid?
  end
end
