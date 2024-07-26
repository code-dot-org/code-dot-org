class CreateLtiCourses < ActiveRecord::Migration[6.1]
  def change
    create_table :lti_courses do |t|
      t.references :lti_integration, index: true, foreign_key: true, null: false, type: :bigint
      t.references :lti_deployment, index: false, foreign_key: true, null: false, type: :bigint
      t.string :context_id
      t.string :course_id
      t.string :nrps_url
      t.string :resource_link_id

      t.timestamps
    end

    add_index :lti_courses, %i[context_id lti_integration_id], name: 'index_on_context_id_and_lti_integration_id'
    add_index :lti_courses, %i[course_id lti_integration_id], name: 'index_on_course_id_and_lti_integration_id'
  end
end
