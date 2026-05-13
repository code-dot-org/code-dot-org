class RemoveIndexFromLtiCoursesOnContextIdAndLtiIntegrationId < ActiveRecord::Migration[6.1]
  def change
    remove_index :lti_courses, %i[context_id lti_integration_id], name: :index_on_context_id_and_lti_integration_id
  end
end
