class RemoveContactIdFromRegionalPartners < ActiveRecord::Migration[5.0]
  def change
    remove_column :regional_partners, :contact_id, :integer
    remove_index :regional_partners, name: "index_regional_partners_on_name_and_contact_id"
  end
end
