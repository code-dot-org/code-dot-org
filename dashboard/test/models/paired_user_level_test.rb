require 'test_helper'

class PairedUserLevelTest < ActiveSupport::TestCase
  self.use_transactional_test_case = true
  setup_all do
    @user_1 = create :user
    @user_2 = create :user
    @user_3 = create :user
    @user_4 = create :user

    @nav_level_1 = create :user_level, user: @user_1
    @driver_level_1 = create :user_level, user: @user_2
    @nav_level_2 = create :user_level, user: @user_2
    @driver_level_2 = create :user_level, user: @user_3
    @nonpaired_level_3 = create :user_level, user: @user_1
    @nonpaired_level_4 = create :user_level, user: @user_2

    PairedUserLevel.create driver_user_level: @driver_level_1,
      navigator_user_level: @nav_level_1
    PairedUserLevel.create driver_user_level: @driver_level_2,
      navigator_user_level: @nav_level_2
  end

  test 'pairs returns empty array on input empty array' do
    assert_equal [], PairedUserLevel.pairs([])
  end

  test 'pairs return paired user_level_ids' do
    assert_equal [@nav_level_1.id, @driver_level_1.id],
      PairedUserLevel.pairs([@nav_level_1.id, @driver_level_1.id]).sort
  end

  test 'pairs doesnt return non-paired user_level_ids' do
    assert_equal [],
      PairedUserLevel.pairs([@nonpaired_level_3.id, @nonpaired_level_4.id]).sort
  end

  test 'pairs filters mix of driver, navigators, and non-paired' do
    assert_equal(
      [@nav_level_1.id, @driver_level_1.id, @nav_level_2.id, @driver_level_2.id],
      PairedUserLevel.pairs(
        [
          @nav_level_1.id, @driver_level_1.id, @nav_level_2.id, @driver_level_2.id,
          @nonpaired_level_3.id, @nonpaired_level_4.id
        ]
      ).sort
    )
  end

  test 'pairs_by_user' do
    assert_queries(2) do
      assert_equal(
        {
          @user_1.id => Set[@nav_level_1.id],
          @user_2.id => Set[@driver_level_1.id, @nav_level_2.id],
          @user_3.id => Set[@driver_level_2.id],
          @user_4.id => Set.new
        },
        PairedUserLevel.pairs_by_user([@user_1, @user_2, @user_3, @user_4])
      )
    end
  end
end
