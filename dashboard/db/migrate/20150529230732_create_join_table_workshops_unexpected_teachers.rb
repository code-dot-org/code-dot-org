class CreateJoinTableWorkshopsUnexpectedTeachers < ActiveRecord::Migration[4.2]
  def change
    create_join_table :workshops, :unexpected_teachers do |t|
      t.index [:workshop_id]
      t.index [:unexpected_teacher_id]
    end
  end
end
