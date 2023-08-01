class CreateLtiIntegrations < ActiveRecord::Migration[6.0]
  def change
    create_table :lti_integrations do |t|
      t.string :name
      t.string :platform_id, null: false
      t.string :issuer, null: false
      t.string :client_id, null: false
      t.string :platform_name, null: false
      t.string :auth_redirect_url, null: false
      t.string :jwks_url, null: false
      t.string :access_token_url, null: false
      t.string :admin_email

      t.timestamps
    end
    add_index :lti_integrations, :platform_id
    add_index :lti_integrations, :issuer
    add_index :lti_integrations, :client_id
  end
end
