class AddIndexOnPdEnrollmentEmail < ActiveRecord::Migration[5.0]
  def change
    add_index :pd_enrollments, :email
  end
end
