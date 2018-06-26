require 'cdo/chat_client'

#
# Module to mix-in to User model providing expressive interactions with
# user permissions.
#
module UserPermissionGrantee
  extend ActiveSupport::Concern

  included do
    has_many :permissions, class_name: 'UserPermission', dependent: :destroy
    before_save :log_admin_save, if: -> {admin_changed? && UserPermissionGrantee.should_log?}
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

  # Revokes all escalated permissions associated with the user,
  # including admin status and any granted UserPermissions.
  def revoke_all_permissions
    @permissions = nil
    update_column(:admin, nil)
    UserPermission.where(user_id: id).each(&:destroy)
    reload
  end

  UserPermission::VALID_PERMISSIONS.each do |permission_name|
    define_method "#{permission_name}?" do
      permission? permission_name
    end
  end

  # Overrides generated permission helper, above.
  def hidden_script_access?
    admin? || permission?(UserPermission::HIDDEN_SCRIPT_ACCESS)
  end

  # don't log changes to admin permission in development, test, and ad_hoc environments
  def self.should_log?
    return [:staging, :levelbuilder, :production].include? rack_env
  end

  private

  # admin can be nil, which should be treated as false
  def admin_changed?
    # no change: false
    # false <-> nil: false
    # false|nil <-> true: true
    !!changes['admin'].try {|from, to| !!from != !!to}
  end

  def log_admin_save
    ChatClient.message 'infra-security',
      "#{admin ? 'Granting' : 'Revoking'} UserPermission: "\
      "environment: #{rack_env}, "\
      "user ID: #{id}, "\
      "email: #{email}, "\
      "permission: ADMIN",
      color: 'yellow'
  end
end
