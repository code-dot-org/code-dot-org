#
# Module to mix-in to User model providing expressive interactions with
# user permissions.
#
module UserPermissionHelper
  def facilitator?
    permission? UserPermission::FACILITATOR
  end

  def workshop_organizer?
    permission? UserPermission::WORKSHOP_ORGANIZER
  end

  def program_manager?
    permission? UserPermission::PROGRAM_MANAGER
  end

  def workshop_admin?
    permission? UserPermission::WORKSHOP_ADMIN
  end

  def project_validator?
    permission? UserPermission::PROJECT_VALIDATOR
  end

  def levelbuilder?
    permission? UserPermission::LEVELBUILDER
  end
end
