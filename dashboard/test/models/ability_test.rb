require 'test_helper'

class AbilityTest < ActiveSupport::TestCase
  setup do
    @public_script = create(:script).tap do |script|
      @public_script_level = create(:script_level, script: script)
    end

    @login_required_script = create(:script, login_required: true).tap do |script|
      @login_required_script_level = create(:script_level, script: script)
    end

    @student_of_admin_script = create(:script, student_of_admin_required: true).tap do |script|
      @student_of_admin_script_level = create(:script_level, script: script)
    end

    @admin_script = create(:script, admin_required: true).tap do |script|
      @admin_script_level = create(:script_level, script: script)
    end
  end

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

    assert ability.can?(:read, @public_script)
    assert !ability.can?(:read, @login_required_script)
    assert !ability.can?(:read, @student_of_admin_script)
    assert !ability.can?(:read, @admin_script)

    assert ability.can?(:read, @public_script_level)
    assert !ability.can?(:read, @login_required_script_level)
    assert !ability.can?(:read, @student_of_admin_script_level)
    assert !ability.can?(:read, @admin_script_level)
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

    assert ability.can?(:read, @public_script)
    assert ability.can?(:read, @login_required_script)
    assert !ability.can?(:read, @student_of_admin_script)
    assert !ability.can?(:read, @admin_script)

    assert ability.can?(:read, @public_script_level)
    assert ability.can?(:read, @login_required_script_level)
    assert !ability.can?(:read, @student_of_admin_script_level)
    assert !ability.can?(:read, @admin_script_level)
  end

  test "as student of admin" do
    ability = Ability.new(create(:student_of_admin))

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

    assert ability.can?(:read, @public_script)
    assert ability.can?(:read, @login_required_script)
    assert ability.can?(:read, @student_of_admin_script)
    assert !ability.can?(:read, @admin_script)

    assert ability.can?(:read, @public_script_level)
    assert ability.can?(:read, @login_required_script_level)
    assert ability.can?(:read, @student_of_admin_script_level)
    assert !ability.can?(:read, @admin_script_level)
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

    assert ability.can?(:read, @public_script)
    assert ability.can?(:read, @login_required_script)
    assert ability.can?(:read, @student_of_admin_script)
    assert ability.can?(:read, @admin_script)

    assert ability.can?(:read, @public_script_level)
    assert ability.can?(:read, @login_required_script_level)
    assert ability.can?(:read, @student_of_admin_script_level)
    assert ability.can?(:read, @admin_script_level)
  end

  test 'with hint_access manage LevelSourceHint and FrequentUnsuccessfulLevelSource' do
    time_now = DateTime.now
    hint_access_student = create :student
    UserPermission.create!(
      user_id: hint_access_student.id,
      permission: UserPermission::HINT_ACCESS,
      created_at: time_now,
      updated_at: time_now
    )
    ability = Ability.new(hint_access_student)

    assert ability.can?(:manage, LevelSourceHint)
    assert ability.can?(:manage, FrequentUnsuccessfulLevelSource)
  end

  test 'teachers manage LevelSourceHint and FrequentUnsuccessfulLevelSource' do
    ability = Ability.new(create(:teacher))

    assert ability.can?(:manage, LevelSourceHint)
    assert ability.can?(:manage, FrequentUnsuccessfulLevelSource)
  end

  test 'students do not manage LevelSourceHint and FrequentUnsuccessfulLevelSource' do
    ability = Ability.new(create(:student))

    assert ability.cannot?(:manage, LevelSourceHint)
    assert ability.cannot?(:manage, FrequentUnsuccessfulLevelSource)
  end

  test 'non-admins can read only own UserPermission' do
    user = create :user
    user_permission = UserPermission.create(
      user_id: user.id, permission: UserPermission::DISTRICT_CONTACT)
    ability = Ability.new user

    ability.cannot?(:create, UserPermission)
    ability.cannot?(:read, UserPermission)
    ability.cannot?(:update, UserPermission)
    ability.cannot?(:delete, UserPermission)

    ability.can?(:read, user_permission)
    ability.cannot?(:create, user_permission)
    ability.cannot?(:update, user_permission)
    ability.cannot?(:delete, user_permission)
  end

  test 'admins can manage UserPermission' do
    admin_ability = Ability.new(create(:admin))
    assert admin_ability.can?(:manage, UserPermission)
  end

  test 'levelbuilders can manage appropriate objects' do
    user = create :user
    UserPermission.create(
      user_id: user.id, permission: UserPermission::LEVELBUILDER)
    ability = Ability.new user

    assert ability.can?(:manage, Level)
    assert ability.can?(:manage, Script)
    assert ability.can?(:manage, ScriptLevel)
    assert ability.can?(:manage, Stage)
  end
end
