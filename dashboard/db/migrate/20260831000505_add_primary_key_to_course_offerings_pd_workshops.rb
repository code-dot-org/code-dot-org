class AddPrimaryKeyToCourseOfferingsPdWorkshops < ActiveRecord::Migration[7.0]
  def up
    execute <<~SQL.squish
      ALTER TABLE course_offerings_pd_workshops
        ADD PRIMARY KEY (pd_workshop_id, course_offering_id)
    SQL
  end

  def down
    execute <<~SQL.squish
      ALTER TABLE course_offerings_pd_workshops
        DROP PRIMARY KEY
    SQL
  end
end
