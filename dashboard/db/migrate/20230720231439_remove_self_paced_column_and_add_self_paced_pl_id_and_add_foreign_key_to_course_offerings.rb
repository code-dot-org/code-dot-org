class RemoveSelfPacedColumnAndAddSelfPacedPlIdAndAddForeignKeyToCourseOfferings < ActiveRecord::Migration[6.1]
  def change
    remove_column :course_offerings, :self_paced_professional_learning, :string
    add_column :course_offerings, :self_paced_pl_course_offering_id, :integer
  end
end
