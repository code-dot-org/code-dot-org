class AddNotNullValidationToIsActiveFieldRegionalPartner < ActiveRecord::Migration[6.0]
  def up
    change_column_null :regional_partners, :is_active, false, true
  end

  def down
  end
end
