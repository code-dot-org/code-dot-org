class CreatePdFacilitatorTeacherconAttendance < ActiveRecord::Migration[5.0]
  def change
    create_table :pd_facilitator_teachercon_attendances do |t|
      t.references :user, index: true, unique: true, null: false

      t.date :tc1_arrive
      t.date :tc1_depart
      t.date :fit1_arrive
      t.date :fit1_depart
      t.string :fit1_course
      t.date :tc2_arrive
      t.date :tc2_depart
      t.date :fit2_arrive
      t.date :fit2_depart
      t.string :fit2_course
      t.date :tc3_arrive
      t.date :tc3_depart
      t.date :fit3_arrive
      t.date :fit3_depart
      t.string :fit3_course
    end
  end
end
