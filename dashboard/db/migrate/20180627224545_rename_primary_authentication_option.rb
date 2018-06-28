class RenamePrimaryAuthenticationOption < ActiveRecord::Migration[5.0]
  def up
    rename_column :users, :primary_authentication_option_id, :primary_contact_info_id
  end

  def down
    rename_column :users, :primary_contact_info_id, :primary_authentication_option_id
  end
end
