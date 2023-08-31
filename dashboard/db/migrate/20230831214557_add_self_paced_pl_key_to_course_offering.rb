class AddSelfPacedPlKeyToCourseOffering < ActiveRecord::Migration[6.1]
  def change
    add_column :course_offerings, :self_paced_pl_course_offering_key, :string
  end
end
