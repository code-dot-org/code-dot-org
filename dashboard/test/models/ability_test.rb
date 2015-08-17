require 'test_helper'

class AbilityTest < ActiveSupport::TestCase
  test "as guest" do
    ability = Ability.new(User.new)

    assert ability.can?(:read, Game)
    assert ability.can?(:read, Level)
    assert ability.can?(:read, Activity)

    assert !ability.can?(:destroy, Game)
    assert !ability.can?(:destroy, Level)
    assert !ability.can?(:destroy, Activity)

    assert !ability.can?(:read, Script.find_by_name('ECSPD'))
    assert ability.can?(:read, Script.find_by_name('flappy'))
  end

  test "as member" do
    ability = Ability.new(create(:user))

    assert ability.can?(:read, Game)
    assert ability.can?(:read, Level)
    assert ability.can?(:read, Activity)

    assert !ability.can?(:destroy, Game)
    assert !ability.can?(:destroy, Level)
    assert !ability.can?(:destroy, Activity)

    assert ability.can?(:create, GalleryActivity)
    assert ability.can?(:destroy, GalleryActivity)

    assert ability.can?(:read, Script.find_by_name('ECSPD'))
    assert ability.can?(:read, Script.find_by_name('flappy'))

  end

  test "as admin" do
    ability = Ability.new(create(:admin))

    assert ability.can?(:read, Game)
    assert ability.can?(:read, Level)
    assert ability.can?(:read, Activity)

    assert ability.can?(:destroy, Game)
    # Can only destroy custom levels
    assert ability.can?(:destroy, Level.where.not(user_id: nil).first)
    assert ability.can?(:destroy, Activity)

    assert ability.can?(:read, Script.find_by_name('ECSPD'))
    assert ability.can?(:read, Script.find_by_name('flappy'))
  end

end
