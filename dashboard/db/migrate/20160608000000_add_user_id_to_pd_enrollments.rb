class AddUserIdToPdEnrollments < ActiveRecord::Migration[4.2]
  def change
    add_reference :pd_enrollments, :user
  end
end
