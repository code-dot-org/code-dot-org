class BackfillRegionalPartnerIsActive < ActiveRecord::Migration[6.0]
  def change
    RegionalPartner.reset_column_information
    RegionalPartner.update_all(is_active: true)
  end
end
