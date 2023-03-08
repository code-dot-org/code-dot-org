class AddInactiveFieldToRegionalPartner < ActiveRecord::Migration[6.0]
  def change
    add_column :regional_partners, :inactive, :boolean
  end
end
