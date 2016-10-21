class RenameDistrictPaymentTermSchoolDistrictId < ActiveRecord::Migration[5.0]
  def change
    rename_column :pd_district_payment_terms, :district_id, :school_district_id
  end
end
