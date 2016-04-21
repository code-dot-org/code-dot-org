require 'test_helper'

class FollowerTest < ActiveSupport::TestCase
  setup do
    @teacher = create(:teacher)
    @student = create(:student)
    @section = create(:section, user: @teacher)
  end

  test 'cannot follow yourself' do
    follower = Follower.create(
      user_id: @teacher.id, student_user_id: @teacher.id, section: @section)
    assert !follower.valid?
  end

  test 'deleted followers are soft-deleted' do
    follower = Follower.create(
      user_id: @teacher.id, student_user_id: @student.id, section: @section)
    follower.destroy

    assert_equal 0, Follower.count
    assert_equal 1, Follower.with_deleted.count
  end
end
