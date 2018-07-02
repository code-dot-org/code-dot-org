class AddUniqueConstraintToPdCourseFacilitators < ActiveRecord::Migration[5.0]
  def change
    add_index :pd_course_facilitators, [:facilitator_id, :course], unique: true
  end
end
