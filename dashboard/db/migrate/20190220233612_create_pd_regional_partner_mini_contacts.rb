class CreatePdRegionalPartnerMiniContacts < ActiveRecord::Migration[5.0]
  def change
    create_table :pd_regional_partner_mini_contacts do |t|
      t.references :user, index: true
      t.references :regional_partner, null: true, index: true
      t.text :form_data
      t.timestamps null: false
    end
  end
end
