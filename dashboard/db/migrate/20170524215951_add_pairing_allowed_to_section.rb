class AddPairingAllowedToSection < ActiveRecord::Migration[5.0]
  def change
    add_column :sections, :pairing_allowed, :boolean, null: false, default: true
  end
end
