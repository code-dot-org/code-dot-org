class MakeUserOptionalInRegionalPartnerContacts < ActiveRecord::Migration[5.0]
  def change
    change_column_null :pd_regional_partner_contacts, :user_id, true
  end
end
