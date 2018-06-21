class RenamePrimaryAuthenticationOption < ActiveRecord::Migration[5.0]
  def change
    rename_column :users, :primary_authentication_option_id, :primary_contact_info_id
  end
end
