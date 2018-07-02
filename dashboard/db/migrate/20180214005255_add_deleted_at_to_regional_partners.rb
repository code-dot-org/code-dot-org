class AddDeletedAtToRegionalPartners < ActiveRecord::Migration[5.0]
  def change
    change_table :regional_partners do |t|
      t.column :deleted_at, :datetime, null: true
    end
  end
end
