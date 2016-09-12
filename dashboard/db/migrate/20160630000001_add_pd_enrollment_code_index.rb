class AddPdEnrollmentCodeIndex < ActiveRecord::Migration[4.2]
  def change
    add_index :pd_enrollments, :code, unique: true
  end
end
