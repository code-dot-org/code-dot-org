class ActiveRegionalPartners < ActiveRecord::Migration[5.0]
  def change
    rename_column(:regional_partners, :urban, :active)
  end
end
