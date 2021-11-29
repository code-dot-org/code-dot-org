class RemoveFieldsFromStandards < ActiveRecord::Migration[5.2]
  def change
    remove_column :standards, :organization
    remove_column :standards, :organization_id
    remove_column :standards, :concept
  end
end
