class AddLtiDeploymentToLtiUserIdentities < ActiveRecord::Migration[6.1]
  def change
    add_reference :lti_user_identities, :lti_deployment, foreign_key: true
  end
end
