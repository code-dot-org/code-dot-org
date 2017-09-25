class ChangeRpsdIndexName < ActiveRecord::Migration[5.0]
  def change
    rename_index :regional_partners_school_districts,
      'index_regional_partners_school_districts_on_regional_partner_id',
      'index_regional_partners_school_districts_on_partner_id'
  end
end
