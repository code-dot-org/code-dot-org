require 'test_helper'

class PuzzleRatingTest < ActiveSupport::TestCase

  setup do
    @student = create :student
    @script = create :script
    @level = create :level
  end

  test "logged-in user can rate unless already rated" do
    PuzzleRating.stubs(:enabled?).returns(true)

    assert_equal PuzzleRating.can_rate?(@script, @level, @student), true

    PuzzleRating.create(script: @script, level: @level, user: @student)

    assert_equal PuzzleRating.can_rate?(@script, @level, @student), false
  end

  test "anonymous can always rate" do
    PuzzleRating.stubs(:enabled?).returns(true)

    assert_equal PuzzleRating.can_rate?(@script, @level, nil), true

    PuzzleRating.create(script: @script, level: @level, user: nil)

    assert_equal PuzzleRating.can_rate?(@script, @level, nil), true
  end

  test "can be disabled" do
    PuzzleRating.stubs(:enabled?).returns(false)

    assert_equal PuzzleRating.exists?(script: @script, level: @level, user: @student), false
    assert_equal PuzzleRating.can_rate?(@script, @level, @student), false
  end

end
