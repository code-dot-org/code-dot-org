require 'test_helper'

class FollowerTest < ActiveSupport::TestCase
  setup do
    @laurel = create(:teacher)
    @laurel_section = create(:section, user: @laurel)
  end

  test "cannot follow yourself" do
    assert_does_not_create(Follower) do
      follower = Follower.create(
        user: @laurel,
        student_user: @laurel,
        section: @laurel_section
      )
      refute follower.valid?
    end
  end
end
