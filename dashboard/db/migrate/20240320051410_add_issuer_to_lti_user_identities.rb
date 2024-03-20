class AddIssuerToLtiUserIdentities < ActiveRecord::Migration[6.1]
  def change
    add_column :lti_user_identities, :issuer, :string
    change_column_null :lti_user_identities, :issuer, false
    add_index :lti_user_identities, :issuer
  end
end
