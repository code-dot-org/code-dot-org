class NullableStandardsFields < ActiveRecord::Migration[5.2]
  def change
    change_column :standards, :organization, :string, null: true
    change_column :standards, :organization_id, :string, null: true
  end
end
