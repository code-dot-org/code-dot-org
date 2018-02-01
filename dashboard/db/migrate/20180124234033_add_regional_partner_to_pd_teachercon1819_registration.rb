class AddRegionalPartnerToPdTeachercon1819Registration < ActiveRecord::Migration[5.0]
  def change
    add_reference :pd_teachercon1819_registrations, :regional_partner, foreign_key: true
  end
end
