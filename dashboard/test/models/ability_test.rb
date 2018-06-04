require 'test_helper'

class AbilityTest < ActiveSupport::TestCase
  self.use_transactional_test_case = true
  setup_all do
    @public_script = create(:script).tap do |script|
      @public_script_level = create(:script_level, script: script)
    end

    @login_required_script = create(:script, login_required: true).tap do |script|
      @login_required_script_level = create(:script_level, script: script)
    end
  end

  test "as guest" do
    ability = Ability.new(User.new)

    assert ability.can?(:read, Game)
    assert ability.can?(:read, Level)
    assert ability.can?(:read, Activity)

    refute ability.can?(:destroy, Game)
    refute ability.can?(:destroy, Level)
    refute ability.can?(:destroy, Activity)

    refute ability.can?(:read, Section)

    refute ability.can?(:read, Script.find_by_name('ECSPD'))
    assert ability.can?(:read, Script.find_by_name('flappy'))

    assert ability.can?(:read, @public_script)
    refute ability.can?(:read, @login_required_script)

    assert ability.can?(:read, @public_script_level)
    refute ability.can?(:read, @login_required_script_level)
  end

  test "as student" do
    ability = Ability.new(create(:student))

    assert ability.can?(:read, Game)
    assert ability.can?(:read, Level)
    assert ability.can?(:read, Activity)

    refute ability.can?(:destroy, Game)
    refute ability.can?(:destroy, Level)
    refute ability.can?(:destroy, Activity)

    refute ability.can?(:read, Section)

    assert ability.can?(:create, GalleryActivity)
    assert ability.can?(:destroy, GalleryActivity)

    assert ability.can?(:read, Script.find_by_name('ECSPD'))
    assert ability.can?(:read, Script.find_by_name('flappy'))

    assert ability.can?(:read, @public_script)
    assert ability.can?(:read, @login_required_script)

    assert ability.can?(:read, @public_script_level)
    assert ability.can?(:read, @login_required_script_level)
  end

  test "as teacher" do
    ability = Ability.new(create(:teacher))

    assert ability.can?(:read, Game)
    assert ability.can?(:read, Level)
    assert ability.can?(:read, Activity)

    refute ability.can?(:destroy, Game)
    refute ability.can?(:destroy, Level)
    refute ability.can?(:destroy, Activity)

    assert ability.can?(:read, Section)

    assert ability.can?(:create, GalleryActivity)
    assert ability.can?(:destroy, GalleryActivity)

    assert ability.can?(:read, Script.find_by_name('ECSPD'))
    assert ability.can?(:read, Script.find_by_name('flappy'))

    assert ability.can?(:read, @public_script)
    assert ability.can?(:read, @login_required_script)

    assert ability.can?(:read, @public_script_level)
    assert ability.can?(:read, @login_required_script_level)
  end

  test "as admin" do
    ability = Ability.new(create(:admin))

    assert ability.cannot?(:read, Activity)
    assert ability.cannot?(:read, Game)
    assert ability.cannot?(:read, Level)
    assert ability.cannot?(:read, Script)
    assert ability.cannot?(:read, ScriptLevel)
    assert ability.cannot?(:read, UserLevel)
    assert ability.cannot?(:read, UserScript)

    assert ability.cannot?(:destroy, Game)
    assert ability.cannot?(:destroy, Level)
    assert ability.cannot?(:destroy, Activity)

    assert ability.cannot?(:read, Script.find_by_name('ECSPD'))
    assert ability.cannot?(:read, Script.find_by_name('flappy'))

    assert ability.cannot?(:read, @public_script)
    assert ability.cannot?(:read, @login_required_script)

    assert ability.cannot?(:read, @public_script_level)
    assert ability.cannot?(:read, @login_required_script_level)
  end

  test 'teachers read their Section' do
    teacher = create :teacher
    ability = Ability.new teacher
    my_section = create :section, user_id: teacher.id
    not_my_section = create :section, user_id: create(:teacher).id

    # When checking a class, conditions are ignored.
    # See https://github.com/ryanb/cancan/wiki/checking-abilities#checking-with-class
    assert ability.can? :read, Section

    # A teacher can read their own section.
    assert ability.can? :read, my_section

    # A teacher cannot read another teacher's section.
    assert ability.cannot? :read, not_my_section
  end

  test 'non-admins can read only own UserPermission' do
    user = create :user
    user_permission = UserPermission.create(
      user_id: user.id,
      permission: UserPermission::DISTRICT_CONTACT
    )
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
    user = create :levelbuilder
    ability = Ability.new user

    assert ability.can?(:manage, Game)
    assert ability.can?(:manage, Level)
    assert ability.can?(:manage, Script)
    assert ability.can?(:manage, ScriptLevel)
  end
end
