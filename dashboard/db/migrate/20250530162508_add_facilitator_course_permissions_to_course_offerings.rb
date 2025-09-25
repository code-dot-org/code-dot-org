class AddFacilitatorCoursePermissionsToCourseOfferings < ActiveRecord::Migration[6.1]
  def change
    add_column :course_offerings, :facilitator_course_permissions, :json
  end
end
