class RequireRegionalPartnerInPaymentTerms < ActiveRecord::Migration[5.0]
  def change
    change_column_null :pd_payment_terms, :regional_partner_id, false
  end
end
