class AddLtiIntegrationRefToSections < ActiveRecord::Migration[6.1]
  def change
    add_column :sections, :lti_integration_id, :bigint
    add_foreign_key :sections, :lti_integrations
  end
end
