require 'test_helper'

class PairedUserLevelTest < ActiveSupport::TestCase
  self.use_transactional_test_case = true
  setup_all do
    @user_1 = create :user
    @user_2 = create :user
    @user_3 = create :user
    @user_4 = create :user

    @level_source_1 = create :level_source

    @nav_level_1 = create :user_level, user: @user_1
    @driver_level_1 = create :user_level, user: @user_2, level_source: @level_source_1
    @nav_level_2 = create :user_level, user: @user_2
    @driver_level_2 = create :user_level, user: @user_3
    @nonpaired_level_3 = create :user_level, user: @user_1
    @nonpaired_level_4 = create :user_level, user: @user_2

    @paired_user_level_1 = PairedUserLevel.create driver_user_level: @driver_level_1,
      navigator_user_level: @nav_level_1
    @paired_user_level_2 = PairedUserLevel.create driver_user_level: @driver_level_2,
      navigator_user_level: @nav_level_2
  end

  setup do
    @paired_user_level_1.reload
    @paired_user_level_2.reload
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

  test 'driver returns correct User object' do
    assert_equal @user_2, @paired_user_level_1.driver
  end

  test 'driver returns nil when the driver user_level is deleted' do
    @driver_level_1.destroy
    assert_nil @paired_user_level_1.driver
  end

  test 'driver returns nil when the driver is deleted' do
    @user_2.destroy
    assert_nil @paired_user_level_1.driver
  end

  test 'driver_level_source_id returns correct value' do
    assert_equal @level_source_1.id, @paired_user_level_1.driver_level_source_id
  end

  test 'driver_level_source_id returns nil when driver user_level is deleted' do
    @driver_level_1.destroy
    assert_nil @paired_user_level_1.driver_level_source_id
  end

  test 'navigators_names returns correct values' do
    # Create records simulating a pairing group of 4 students with @user_1 as the driver
    user_level_1 = create :user_level, user: @user_1
    user_level_2 = create :user_level, user: @user_2
    user_level_3 = create :user_level, user: @user_3
    user_level_4 = create :user_level, user: @user_4

    paired_user_level_1_2 = create :paired_user_level, driver_user_level: user_level_1, navigator_user_level: user_level_2
    paired_user_level_1_3 = create :paired_user_level, driver_user_level: user_level_1, navigator_user_level: user_level_3
    paired_user_level_1_4 = create :paired_user_level, driver_user_level: user_level_1, navigator_user_level: user_level_4

    assert_equal [@user_4.name, @user_3.name, @user_2.name], paired_user_level_1_2.navigators_names
    assert_equal [@user_4.name, @user_3.name],               paired_user_level_1_2.navigators_names(exclude_self: true)
    assert_equal [@user_4.name, @user_3.name, @user_2.name], paired_user_level_1_3.navigators_names
    assert_equal [@user_4.name, @user_2.name],               paired_user_level_1_3.navigators_names(exclude_self: true)
    assert_equal [@user_4.name, @user_3.name, @user_2.name], paired_user_level_1_4.navigators_names
    assert_equal [@user_3.name, @user_2.name],               paired_user_level_1_4.navigators_names(exclude_self: true)
  end

  test 'navigators_names excludes deleted users' do
    @user_1.destroy
    assert_equal [], @paired_user_level_1.navigators_names
  end

  test 'navigators_names excludes users with deleted progress' do
    @nav_level_1.destroy
    assert_equal [], @paired_user_level_1.navigators_names
  end

  test 'navigator_count returns correct value' do
    # Create records simulating a pairing group of 4 students with @user_1 as the driver
    user_level_1 = create :user_level, user: @user_1
    user_level_2 = create :user_level, user: @user_2
    user_level_3 = create :user_level, user: @user_3
    user_level_4 = create :user_level, user: @user_4

    paired_user_level_1_2 = create :paired_user_level, driver_user_level: user_level_1, navigator_user_level: user_level_2
    paired_user_level_1_3 = create :paired_user_level, driver_user_level: user_level_1, navigator_user_level: user_level_3
    paired_user_level_1_4 = create :paired_user_level, driver_user_level: user_level_1, navigator_user_level: user_level_4

    assert_equal 3, paired_user_level_1_2.navigator_count
    assert_equal 3, paired_user_level_1_3.navigator_count
    assert_equal 3, paired_user_level_1_4.navigator_count
  end

  test 'navigator_count includes deleted users' do
    @user_1.destroy
    assert_equal 1, @paired_user_level_1.navigator_count
  end

  test 'navigator_count includes users with deleted progress' do
    @nav_level_1.destroy
    assert_equal 1, @paired_user_level_1.navigator_count
  end
end
