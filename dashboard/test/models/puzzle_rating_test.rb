require 'test_helper'

class PuzzleRatingTest < ActiveSupport::TestCase
  setup do
    @student = create :student
    @unit = create :script
    @level = create :level
  end

  test "logged-in user can rate unless already rated" do
    PuzzleRating.stubs(:enabled?).returns(true)

    assert_equal true, PuzzleRating.can_rate?(@script, @level, @student)

    PuzzleRating.create(script: @script, level: @level, user: @student, rating: 0)

    assert_equal false, PuzzleRating.can_rate?(@script, @level, @student)
  end

  test "anonymous can always rate" do
    PuzzleRating.stubs(:enabled?).returns(true)

    assert_equal true, PuzzleRating.can_rate?(@script, @level, nil)

    PuzzleRating.create(script: @script, level: @level, user: nil, rating: 0)

    assert_equal true, PuzzleRating.can_rate?(@script, @level, nil)
  end

  test "can be disabled" do
    PuzzleRating.stubs(:enabled?).returns(false)

    assert_equal false, PuzzleRating.exists?(script: @script, level: @level, user: @student)
    assert_equal false, PuzzleRating.can_rate?(@script, @level, @student)
  end
end
