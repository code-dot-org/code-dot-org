class AddUserIdToPdTeachercon1819Registrations < ActiveRecord::Migration[5.0]
  def change
    add_reference :pd_teachercon1819_registrations, :user, foreign_key: true
  end
end
