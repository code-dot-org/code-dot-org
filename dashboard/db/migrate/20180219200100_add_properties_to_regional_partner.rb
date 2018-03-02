class AddPropertiesToRegionalPartner < ActiveRecord::Migration[5.0]
  def change
    add_column :regional_partners, :properties, :text
  end
end
