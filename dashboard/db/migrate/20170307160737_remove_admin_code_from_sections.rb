class RemoveAdminCodeFromSections < ActiveRecord::Migration[5.0]
  def change
    remove_column :sections, :admin_code, :string
  end
end
