class CreateJoinTableWorkshopCourseOffering < ActiveRecord::Migration[6.1]
  def change
    create_join_table :pd_workshops, :course_offerings, table_name: :pl_workshop_topics do |t|
      t.index :pd_workshop_id
      t.index :course_offering_id
      t.timestamps
    end
  end
end
