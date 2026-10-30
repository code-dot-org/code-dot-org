class DropPdPaymentTermsAndPdDistrictPaymentTermsTables < ActiveRecord::Migration[6.1]
  def change
    drop_table :pd_payment_terms
    drop_table :pd_district_payment_terms
  end
end
