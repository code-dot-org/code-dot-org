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

  test 'follower.user uses section.user_id and not follower.user_id' do
    follower = create :follower, section: @laurel_section
    # As the user_must_be_section_user validation enforces that follower.user_id
    # and follower.section.user_id are the same, we bypass validations to create
    # a difference.
    follower.update_columns(user_id: create(:teacher).id)
    assert_equal @laurel, follower.user
  end
end
