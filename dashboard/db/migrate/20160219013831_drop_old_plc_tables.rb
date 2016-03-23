class DropOldPlcTables < ActiveRecord::Migration
  def up
    drop_table :professional_learning_courses if ActiveRecord::Base.connection.table_exists? :professional_learning_courses
    drop_table :professional_learning_modules if ActiveRecord::Base.connection.table_exists? :professional_learning_modules
    drop_table :professional_learning_tasks if ActiveRecord::Base.connection.table_exists? :professional_learning_tasks
    drop_table :user_professional_learning_course_enrollments if ActiveRecord::Base.connection.table_exists? :user_professional_learning_course_enrollments
    drop_table :user_enrollment_module_assignments if ActiveRecord::Base.connection.table_exists? :user_enrollment_module_assignments
    drop_table :use_module_task_assignments if ActiveRecord::Base.connection.table_exists? :use_module_task_assignments
  end
end
