class AddUserBirthdayIndex < ActiveRecord::Migration[5.0]
  def change
    add_index :users, :birthday
  end
end
