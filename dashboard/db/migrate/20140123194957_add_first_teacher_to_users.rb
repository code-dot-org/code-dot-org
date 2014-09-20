class AddFirstTeacherToUsers < ActiveRecord::Migration
  def change
    add_reference :users, :prize_teacher
  end
end
