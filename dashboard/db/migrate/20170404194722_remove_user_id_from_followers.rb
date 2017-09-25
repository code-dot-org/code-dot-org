class RemoveUserIdFromFollowers < ActiveRecord::Migration[5.0]
  def change
    remove_index :followers, [:user_id, :student_user_id]
    remove_column :followers, :user_id, :integer
  end
end
