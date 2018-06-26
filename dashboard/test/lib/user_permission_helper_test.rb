require 'test_helper'

class UserPermissinoHelperTest < ActiveSupport::TestCase
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
end
