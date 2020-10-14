require 'test_helper'

class UserPermissionGranteeTest < ActiveSupport::TestCase
  test 'permission? returns true when permission exists' do
    user = create :facilitator
    assert user.permission?(UserPermission::FACILITATOR)
  end

  test 'permission? returns false when permission does not exist' do
    user = create :user
    UserPermission.create(
      user_id: user.id, permission: UserPermission::FACILITATOR
    )

    refute user.permission?(UserPermission::LEVELBUILDER)
  end

  test 'permission? caches all permissions' do
    user = create :facilitator
    user.permission?(UserPermission::LEVELBUILDER)

    no_database

    assert user.permission?(UserPermission::FACILITATOR)
    refute user.permission?(UserPermission::LEVELBUILDER)
  end

  test 'delete_permission removes one permission from user' do
    user = create :teacher
    user.permission = UserPermission::FACILITATOR
    user.permission = UserPermission::LEVELBUILDER

    assert user.facilitator?
    assert user.levelbuilder?

    user.delete_permission UserPermission::LEVELBUILDER

    assert user.facilitator?
    refute user.levelbuilder?
  end

  test 'revoke_all_permissions revokes admin status' do
    admin_user = create :admin
    admin_user.revoke_all_permissions
    assert_nil admin_user.admin
  end

  test 'revoke_all_permissions revokes user permissions' do
    teacher = create :teacher
    teacher.permission = UserPermission::FACILITATOR
    teacher.permission = UserPermission::LEVELBUILDER
    teacher.revoke_all_permissions
    assert_equal [], teacher.permissions
  end

  test 'revoke_all_permissions drops permission cache' do
    user = create :facilitator
    # This call populates the permission cache
    user.permission?(UserPermission::LEVELBUILDER)

    assert user.facilitator?
    refute user.levelbuilder?

    user.revoke_all_permissions

    refute user.facilitator?
    refute user.levelbuilder?
  end

  test 'authorized_teacher?' do
    user = create :teacher
    refute user.authorized_teacher?
    user.permission = UserPermission::AUTHORIZED_TEACHER
    assert user.authorized_teacher?
  end

  test 'census_reviewer?' do
    user = create :teacher
    refute user.census_reviewer?
    user.permission = UserPermission::CENSUS_REVIEWER
    assert user.census_reviewer?
  end

  test 'facilitator?' do
    user = create :teacher
    refute user.facilitator?
    user.permission = UserPermission::FACILITATOR
    assert user.facilitator?
  end

  test 'hidden_script_access? is false if user is not admin and does not have permission' do
    user = create :student
    refute user.hidden_script_access?
  end

  test 'hidden_script_access? is true if user is admin' do
    user = create :admin
    assert user.hidden_script_access?
  end

  test 'hidden_script_access? is true if user has permission' do
    user = create :teacher
    user.update(permission: UserPermission::HIDDEN_SCRIPT_ACCESS)
    assert user.hidden_script_access?
  end

  test 'levelbuilder?' do
    user = create :teacher
    refute user.levelbuilder?
    user.permission = UserPermission::LEVELBUILDER
    assert user.levelbuilder?
  end

  test 'plc_reviewer?' do
    user = create :teacher
    refute user.plc_reviewer?
    user.permission = UserPermission::PLC_REVIEWER
    assert user.plc_reviewer?
  end

  test 'program_manager?' do
    user = create :teacher
    refute user.program_manager?
    user.permission = UserPermission::PROGRAM_MANAGER
    assert user.program_manager?
  end

  test 'project_validator?' do
    user = create :teacher
    refute user.project_validator?
    user.permission = UserPermission::PROJECT_VALIDATOR
    assert user.project_validator?
  end

  test 'workshop_admin?' do
    user = create :teacher
    refute user.workshop_admin?
    user.permission = UserPermission::WORKSHOP_ADMIN
    assert user.workshop_admin?
  end

  test 'workshop_organizer?' do
    user = create :teacher
    refute user.workshop_organizer?
    user.permission = UserPermission::WORKSHOP_ORGANIZER
    assert user.workshop_organizer?
  end

  test 'grant admin permission logs to infrasecurity' do
    teacher = create :teacher, :google_sso_provider, password: nil

    UserPermissionGrantee.stubs(:should_log?).returns(true)
    ChatClient.
      expects(:message).
      with('infra-security',
        "Granting UserPermission: environment: #{rack_env}, "\
        "user ID: #{teacher.id}, "\
        "email: #{teacher.email}, "\
        "permission: ADMIN",
        color: 'yellow'
      ).
      returns(true)

    teacher.update!(admin: true)
  end

  test 'revoke admin permission logs to infrasecurity' do
    admin_user = create :admin

    UserPermissionGrantee.stubs(:should_log?).returns(true)
    ChatClient.
      expects(:message).
      with('infra-security',
        "Revoking UserPermission: environment: #{rack_env}, "\
        "user ID: #{admin_user.id}, "\
        "email: #{admin_user.email}, "\
        "permission: ADMIN",
        color: 'yellow'
      ).
      returns(true)

    admin_user.update(admin: nil)
  end

  test 'new admin users log admin permission' do
    UserPermissionGrantee.stubs(:should_log?).returns(true)
    ChatClient.expects(:message)
    create :admin
  end

  test 'new non-admin users do not log admin permission' do
    UserPermissionGrantee.stubs(:should_log?).returns(true)
    ChatClient.expects(:message).never
    create :teacher
  end

  test 'admin_changed? equates nil and false' do
    # admins must be teacher
    teacher = create :admin

    # Each row is a test consisting of 3 values in order:
    #   from - the initial state of the admin attribute
    #   to - the new local state to be assigned
    #   result - the expected admin_changed? after assigning to
    matrix = [
      [nil, nil, false],
      [nil, false, false],
      [nil, true, true],
      [false, nil, false],
      [false, false, false],
      [false, true, true],
      [true, nil, true],
      [true, false, true],
      [true, true, false]
    ]

    matrix.each do |from, to, result|
      teacher.update!(admin: from)
      teacher.admin = to
      assert_equal result, teacher.send(:admin_changed?)
    end
  end

  test 'grant admin permission does not log in test environment' do
    ChatClient.expects(:message).never
    create :admin
  end
end
