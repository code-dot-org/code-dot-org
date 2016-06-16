class AddUserIdToPdEnrollments < ActiveRecord::Migration
  def change
    add_reference :pd_enrollments, :user
  end
end
