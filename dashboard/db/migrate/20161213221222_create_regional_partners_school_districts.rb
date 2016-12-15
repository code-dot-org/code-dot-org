class CreateRegionalPartnersSchoolDistricts < ActiveRecord::Migration[5.0]
  def change
    create_join_table :regional_partners, :school_districts do |t|
      t.index :regional_partner_id
      t.index :school_district_id
    end
  end
end
