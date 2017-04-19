require 'test_helper'

class FollowerTest < ActiveSupport::TestCase
  setup do
    @laurel = create(:teacher)
    @laurel_section = create(:section, user: @laurel)
    @follower = create :follower
  end

  test "followers are soft-deleted" do
    assert_no_change("Follower.with_deleted.count") do
      @follower.destroy
      assert @follower.reload.deleted?
    end
  end

  test "undeleting follower does not undelete section" do
    @follower.section.destroy

    @follower.restore
    @follower.reload

    refute @follower.deleted?
    assert @follower.section.nil?
    assert Section.with_deleted.find_by_id(@follower.section_id).deleted?
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
