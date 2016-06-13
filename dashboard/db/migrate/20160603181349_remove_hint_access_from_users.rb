class RemoveHintAccessFromUsers < ActiveRecord::Migration
  # In the up direction, create a UserPermission entry for anyone having
  # hint_access, followed by removing the hint_access column.
  def up
    User.with_deleted.where(hint_access: true).each do |user|
      user.permission = UserPermission::HINT_ACCESS
    end

    remove_column :users, :hint_access, :boolean
  end

  # In the down direction, add back the hint_access column, set hint_access for
  # anyone having the hint_access UserPermission, and remove the hint_access
  # UserPermissions.
  def down
    add_column :users, :hint_access, :boolean, :after => :prize_teacher_id

    UserPermission.where(permission: UserPermission::HINT_ACCESS).each do |user_permission|
      # Note that we intentionally bypass validation as not all User objects
      # pass validation (without any changes).
      User.where(id: user_permission.user_id).update_all(hint_access: true)
    end

    UserPermission.where(permission: UserPermission::HINT_ACCESS).destroy_all
  end
end
