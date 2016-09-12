class AddFirstTeacherToUsers < ActiveRecord::Migration[4.2]
  def change
    add_reference :users, :prize_teacher
  end
end
