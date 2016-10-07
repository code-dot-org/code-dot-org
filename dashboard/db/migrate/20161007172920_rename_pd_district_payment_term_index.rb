class RenamePdDistrictPaymentTermIndex < ActiveRecord::Migration[5.0]
  def change
    rename_index :pd_district_payment_terms,
      'index_pd_district_payment_terms_on_school_district_id_and_course',
      'index_pd_district_payment_terms_school_district_course'
  end
end
