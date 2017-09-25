class IndexFollowers < ActiveRecord::Migration[5.0]
  def change
    add_index :followers, [:section_id, :student_user_id]
    remove_index :followers, :section_id
  end
end
