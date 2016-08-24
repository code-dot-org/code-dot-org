class AddPdCourseFacilitator < ActiveRecord::Migration[4.2]
  def change
    create_table :pd_course_facilitators do |t|
      t.references :facilitator, null: false
      t.string :course, null: false, index: true
    end
  end
end
