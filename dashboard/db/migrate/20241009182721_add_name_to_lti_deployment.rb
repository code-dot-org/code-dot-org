class AddNameToLtiDeployment < ActiveRecord::Migration[6.1]
  def change
    add_column :lti_deployments, :name, :string
  end
end
