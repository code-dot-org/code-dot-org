class AddColumnsToRegionalPartner < ActiveRecord::Migration[5.0]
  def change
    add_column :regional_partners, :cohort_capacity_csp, :integer
    add_column :regional_partners, :cohort_capacity_csd, :integer
  end
end
