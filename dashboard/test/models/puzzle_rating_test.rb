require 'test_helper'

class PuzzleRatingTest < ActiveSupport::TestCase

  setup do
    @student = create :student
    @script = create :script
    @level = create :level
  end

  test "can rate unless already rated" do
    PuzzleRating.stubs(:enabled?).returns(true)

    assert_equal PuzzleRating.can_rate?(script: @script, level: @level, user: @student), true

    PuzzleRating.create(script: @script, level: @level, user: @student, rating: 1)

    assert_equal PuzzleRating.can_rate?(script: @script, level: @level, user: @student), false
  end

  test "can be disabled" do
    PuzzleRating.stubs(:enabled?).returns(false)

    assert_equal PuzzleRating.exists?(script: @script, level: @level, user: @student), false
    assert_equal PuzzleRating.can_rate?(script: @script, level: @level, user: @student), false
  end

end
