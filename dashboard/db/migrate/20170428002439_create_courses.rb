class CreateCourses < ActiveRecord::Migration[5.0]
  # We override the Plc::Course definition to not have name delegated to the ::Course model.
  # The model as defined here represents what this model looked like at the point when
  # this migration was originally run on production.
  class Plc::Course < ActiveRecord::Base
    has_many :plc_enrollments, class_name: '::Plc::UserCourseEnrollment', foreign_key: 'plc_course_id', dependent: :destroy
    has_many :plc_course_units, class_name: '::Plc::CourseUnit', foreign_key: 'plc_course_id', dependent: :destroy
    belongs_to :course, class_name: '::Course', foreign_key: 'course_id', dependent: :destroy, required: true
  end

  # Override Course here similar to above, so the more recent name validation won't run and fail during the migration.
  class Course < ActiveRecord::Base
    has_one :plc_course, class_name: 'Plc::Course'
  end

  def change
    create_table :courses do |t|
      t.string :name, index: true
      t.text :properties

      t.timestamps
    end

    add_column :plc_courses, :course_id, :integer
    add_foreign_key :plc_courses, :courses

    reversible do |dir|
      dir.up do
        Plc::Course.reset_column_information
        Plc::Course.find_each do |plc_course|
          course = Course.create!(name: plc_course.name)
          plc_course.update!(course_id: course.id)
        end
      end
      dir.down do
        # do nothing on a down as we'll already have deleted the new table/column
      end
    end
  end
end
