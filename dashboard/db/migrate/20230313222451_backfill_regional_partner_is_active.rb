class BackfillRegionalPartnerIsActive < ActiveRecord::Migration[6.0]
  def up
    RegionalPartner.reset_column_information
    RegionalPartner.update_all(is_active: true)
  end

  def down
  end
end
