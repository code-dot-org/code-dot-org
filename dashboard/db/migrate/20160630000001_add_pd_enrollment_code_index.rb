class AddPdEnrollmentCodeIndex < ActiveRecord::Migration
  def change
    add_index :pd_enrollments, :code, unique: true
  end
end
