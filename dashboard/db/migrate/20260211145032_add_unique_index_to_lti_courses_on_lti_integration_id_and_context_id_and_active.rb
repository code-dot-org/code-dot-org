class AddUniqueIndexToLtiCoursesOnLtiIntegrationIdAndContextIdAndActive < ActiveRecord::Migration[6.1]
  def up
    execute <<~SQL.squish
      CREATE UNIQUE INDEX index_lti_courses_on_context_integration_active ON lti_courses (
        context_id,
        lti_integration_id,
        (IF(deleted_at IS NULL, TRUE, NULL)) /* MySQL allows multiple NULL values in a unique index */
      );
    SQL
  end

  def down
    remove_index :lti_courses, name: :index_lti_courses_on_context_integration_active, if_exists: true
  end
end
