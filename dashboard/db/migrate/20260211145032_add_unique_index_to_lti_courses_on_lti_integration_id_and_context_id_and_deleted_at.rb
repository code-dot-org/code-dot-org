class AddUniqueIndexToLtiCoursesOnLtiIntegrationIdAndContextIdAndDeletedAt < ActiveRecord::Migration[6.1]
  def change
    add_index :lti_courses, %i[context_id lti_integration_id deleted_at], unique: true,
              name: :index_lti_courses_on_context_integration_deleted
  end
end
