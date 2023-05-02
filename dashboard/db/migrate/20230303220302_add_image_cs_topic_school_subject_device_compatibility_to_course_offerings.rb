class AddImageCsTopicSchoolSubjectDeviceCompatibilityToCourseOfferings < ActiveRecord::Migration[6.0]
  def change
    add_column :course_offerings, :image, :string
    add_column :course_offerings, :cs_topic, :string
    add_column :course_offerings, :school_subject, :string
    add_column :course_offerings, :device_compatibility, :string
  end
end
