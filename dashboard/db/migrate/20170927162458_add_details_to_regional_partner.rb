class AddDetailsToRegionalPartner < ActiveRecord::Migration[5.0]
  def change
    add_column :regional_partners, :attention, :string
    add_column :regional_partners, :street, :string
    add_column :regional_partners, :apartment_or_suite, :string
    add_column :regional_partners, :city, :string
    add_column :regional_partners, :state, :string
    add_column :regional_partners, :zip_code, :string
    add_column :regional_partners, :phone_number, :string
    add_column :regional_partners, :notes, :text
  end
end
