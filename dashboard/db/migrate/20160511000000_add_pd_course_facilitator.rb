class AddPdCourseFacilitator < ActiveRecord::Migration
  def change
    create_table :pd_course_facilitators do |t|
      t.references :facilitator, null: false
      t.string :course, null: false, index: true
    end
  end
end
