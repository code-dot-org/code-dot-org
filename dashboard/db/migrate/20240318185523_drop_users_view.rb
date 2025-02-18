class DropUsersView < ActiveRecord::Migration[6.1]
  def change
    drop_view :users_view
  end
end
