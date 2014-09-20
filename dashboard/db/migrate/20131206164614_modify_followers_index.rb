class ModifyFollowersIndex < ActiveRecord::Migration
  def change
    remove_index(:followers, [:user_id,:student_user_id])
    add_index :followers, [:user_id,:student_user_id, :section_id], unique: true
  end
end
