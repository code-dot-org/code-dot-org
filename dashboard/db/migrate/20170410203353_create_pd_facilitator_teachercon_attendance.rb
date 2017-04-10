class CreatePdFacilitatorTeacherconAttendance < ActiveRecord::Migration[5.0]
  def change
    create_table :pd_facilitator_teachercon_attendances do |t|
      t.references :user, index: true, unique: true, null: false

      t.date :tc1_arrive
      t.date :tc1_depart
      t.date :fit1_arrive
      t.date :fit1_depart
      t.string :tc1_program
      t.date :tc2_arrive
      t.date :tc2_depart
      t.date :fit2_arrive
      t.date :fit2_depart
      t.string :tc2_program
      t.date :tc3_arrive
      t.date :tc3_depart
      t.date :fit3_arrive
      t.date :fit3_depart
      t.string :tc3_program
    end
  end
end
