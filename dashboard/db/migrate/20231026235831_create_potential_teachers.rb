class CreatePotentialTeachers < ActiveRecord::Migration[6.1]
  def change
    create_table :potential_teachers do |t|
      t.string :name
      t.string :email
      t.integer :source_course_offering_id

      t.timestamps
    end
  end
end
