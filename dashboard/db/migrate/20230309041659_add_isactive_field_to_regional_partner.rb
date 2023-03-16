class AddIsactiveFieldToRegionalPartner < ActiveRecord::Migration[6.0]
  def change
    add_column :regional_partners, :is_active, :boolean
  end
end
