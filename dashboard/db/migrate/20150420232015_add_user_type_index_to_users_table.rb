class AddUserTypeIndexToUsersTable < ActiveRecord::Migration
  def change
    add_index :users, :user_type
  end
end
