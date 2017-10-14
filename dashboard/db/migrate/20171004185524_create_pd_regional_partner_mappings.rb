class CreatePdRegionalPartnerMappings < ActiveRecord::Migration[5.0]
  def change
    create_table :pd_regional_partner_mappings do |t|
      t.references :regional_partner, index: true, null: false
      t.string :state, null: true
      t.string :zip_code, null: true
      t.timestamps
    end

    add_index :pd_regional_partner_mappings,
      [:regional_partner_id, :state, :zip_code],
      unique: true,
      name: 'index_pd_regional_partner_mappings_on_id_and_state_and_zip_code'
  end
end
