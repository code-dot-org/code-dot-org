class CreateLtiDeployments < ActiveRecord::Migration[6.1]
  def change
    create_table :lti_deployments do |t|
      t.string :deployment_id
      t.references :lti_integration, null: false, foreign_key: true, type: :bigint

      t.timestamps
    end

    add_index :lti_deployments, :deployment_id
  end
end
