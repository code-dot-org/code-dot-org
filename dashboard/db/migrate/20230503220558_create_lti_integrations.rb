class CreateLtiIntegrations < ActiveRecord::Migration[6.0]
  def change
    create_table :lti_integrations do |t|
      t.string :name
      t.string :platform_id
      t.string :issuer
      t.string :client_id
      t.string :platform_name
      t.string :auth_redirect_url
      t.string :jwks_url
      t.string :access_token_url
      t.string :admin_email

      t.timestamps
    end
    add_index :lti_integrations, :platform_id
    add_index :lti_integrations, :issuer
    add_index :lti_integrations, :client_id
  end
end
