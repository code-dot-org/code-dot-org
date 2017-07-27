require 'test_helper'

class FollowerTest < ActiveSupport::TestCase
  setup do
    @laurel = create(:teacher)
    @laurel_section = create(:section, user: @laurel)
    @follower = create :follower
  end

  test 'student_user is required' do
    @follower.student_user = nil
    refute @follower.valid?
    assert_equal ['Student user is required'], @follower.errors.full_messages
  end

  test 'section is required' do
    @follower.section = nil
    refute @follower.valid?
    assert_equal ['Section is required'], @follower.errors.full_messages
  end

  test 'admins cannot be student followers' do
    assert_raises do
      assert_does_not_create(Follower) do
        create :follower, student_user: (create :admin)
      end
    end
  end

  # Ideally this test would also confirm cannot_follow_yourself and teacher_must_be_teacher are only
  # validated for non-deleted followers. As this situation cannot happen without manipulating the DB
  # (dependent callbacks), we do not worry about testing it.
  test 'student_user and section not required for deleted followers' do
    follower = create :follower
    follower.destroy
    follower.student_user = nil
    follower.section = nil

    assert follower.valid?
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
