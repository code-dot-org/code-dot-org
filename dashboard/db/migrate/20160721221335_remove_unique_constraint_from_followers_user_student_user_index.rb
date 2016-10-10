class RemoveUniqueConstraintFromFollowersUserStudentUserIndex < ActiveRecord::Migration[4.2]
  def up
    remove_index :followers, [:user_id, :student_user_id]
    add_index :followers, [:user_id, :student_user_id], unique: false
  end

  def down
    remove_index :followers, [:user_id, :student_user_id]
    add_index :followers, [:user_id, :student_user_id], unique: true
  end
end
