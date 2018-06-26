require 'test_helper'

class UserPermissionHelperTest < ActiveSupport::TestCase
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
    assert_nil admin_user.reload.admin
  end

  test 'revoke_all_permissions revokes user permissions' do
    teacher = create :teacher
    teacher.permission = UserPermission::FACILITATOR
    teacher.permission = UserPermission::LEVELBUILDER
    teacher.revoke_all_permissions
    assert_equal [], teacher.reload.permissions
  end

  test 'facilitator?' do
    user = create :teacher
    refute user.facilitator?
    user.permission = UserPermission::FACILITATOR
    assert user.facilitator?
  end

  test 'workshop_organizer?' do
    user = create :teacher
    refute user.workshop_organizer?
    user.permission = UserPermission::WORKSHOP_ORGANIZER
    assert user.workshop_organizer?
  end

  test 'program_manager?' do
    user = create :teacher
    refute user.program_manager?
    user.permission = UserPermission::PROGRAM_MANAGER
    assert user.program_manager?
  end

  test 'workshop_admin?' do
    user = create :teacher
    refute user.workshop_admin?
    user.permission = UserPermission::WORKSHOP_ADMIN
    assert user.workshop_admin?
  end

  test 'project_validator?' do
    user = create :teacher
    refute user.project_validator?
    user.permission = UserPermission::PROJECT_VALIDATOR
    assert user.project_validator?
  end

  test 'levelbuilder?' do
    user = create :teacher
    refute user.levelbuilder?
    user.permission = UserPermission::LEVELBUILDER
    assert user.levelbuilder?
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
end
