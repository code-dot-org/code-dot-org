class CreateJoinTableLtiDeploymentsLtiUserIdentities < ActiveRecord::Migration[6.1]
  def change
    create_join_table :lti_deployments, :lti_user_identities do |t|
      t.index :lti_deployment_id
      t.index :lti_user_identity_id
    end
  end
end
