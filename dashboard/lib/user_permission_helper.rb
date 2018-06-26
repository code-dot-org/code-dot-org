#
# Module to mix-in to User model providing expressive interactions with
# user permissions.
#
module UserPermissionHelper
  extend ActiveSupport::Concern

  included do
    has_many :permissions, class_name: 'UserPermission', dependent: :destroy
  end

  # @param permission [UserPermission] the permission to query.
  # @return [Boolean] whether the User has permission granted.
  def permission?(permission)
    return false unless teacher?
    if @permissions.nil?
      # The user's permissions have not yet been cached, so do the DB query,
      # caching the results.
      @permissions = UserPermission.where(user_id: id).pluck(:permission)
    end
    # Return the cached results.
    @permissions.include? permission
  end

  def permission=(permission)
    @permissions = nil
    permissions << permissions.find_or_create_by(user_id: id, permission: permission)
  end

  def delete_permission(permission)
    @permissions = nil
    permission = permissions.find_by(permission: permission)
    permissions.delete permission if permission
  end

  # Revokes all escalated permissions associated with the user, including admin status and any
  # granted UserPermission's.
  def revoke_all_permissions
    update_column(:admin, nil)
    UserPermission.where(user_id: id).each(&:destroy)
  end

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
