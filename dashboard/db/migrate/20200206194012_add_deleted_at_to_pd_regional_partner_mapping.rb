class AddDeletedAtToPdRegionalPartnerMapping < ActiveRecord::Migration[5.0]
  def change
    add_column :pd_regional_partner_mappings, :deleted_at, :datetime
  end
end
