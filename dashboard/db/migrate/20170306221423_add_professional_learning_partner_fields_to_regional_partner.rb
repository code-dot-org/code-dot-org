class AddProfessionalLearningPartnerFieldsToRegionalPartner < ActiveRecord::Migration[5.0]
  def change
    add_column :regional_partners, :contact_id, :integer
    add_column :regional_partners, :urban, :boolean

    add_index :regional_partners, [:name, :contact_id], unique: true
  end
end
