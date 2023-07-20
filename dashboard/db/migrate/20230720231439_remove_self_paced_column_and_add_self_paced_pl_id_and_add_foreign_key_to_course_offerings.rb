class RemoveSelfPacedColumnAndAddSelfPacedPlIdAndAddForeignKeyToCourseOfferings < ActiveRecord::Migration[6.1]
  def change
    remove_column :course_offerings, :self_paced_professional_learning
    add_column :course_offerings, :self_paced_pl_course_offering_id, :integer
    add_foreign_key :course_offerings, :course_offerings, column: :self_paced_pl_course_offering_id
  end
end
