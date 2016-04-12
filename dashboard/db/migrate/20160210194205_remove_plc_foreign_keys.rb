class RemovePlcForeignKeys < ActiveRecord::Migration
  def up
    remove_foreign_key_if_exists :professional_learning_tasks, :professional_learning_module_id
    remove_foreign_key_if_exists :user_professional_learning_course_enrollments, :user_id
    remove_foreign_key_if_exists :user_professional_learning_course_enrollments, :professional_learning_course_id
    remove_foreign_key_if_exists :user_enrollment_module_assignments, :professional_learning_module_id
    remove_foreign_key_if_exists :user_enrollment_module_assignments, :user_professional_learning_course_enrollment_id
    remove_foreign_key_if_exists :user_module_task_assignments, :user_enrollment_module_assignment_id
    remove_foreign_key_if_exists :user_module_task_assignments, :professional_learning_task_id
    remove_foreign_key_if_exists :plc_evaluation_questions, :professional_learning_course_id
  end

  def down

  end

  #Come on Rails, can't you make an idempotent remove foreign key method?
  def remove_foreign_key_if_exists(table, key)
    remove_foreign_key table, column: key if foreign_keys(table).find_index {|x| x.column == key.to_s} != nil
  end
end
