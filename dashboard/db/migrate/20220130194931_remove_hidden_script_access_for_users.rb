class RemoveHiddenScriptAccessForUsers < ActiveRecord::Migration[5.2]
  def change
    UserPermission.where(permission: "hidden_script_access").destroy_all
  end
end
