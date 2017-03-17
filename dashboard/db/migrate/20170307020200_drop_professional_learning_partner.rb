class DropProfessionalLearningPartner < ActiveRecord::Migration[5.0]
  def change
    # note that in migration
    # 20170306221907_merge_professional_learning_partner_into_regional_partner,
    # we transfer all data in this table to (and from) another table.
    # Taken together, these two migrations should be fully reversible.
    drop_table :professional_learning_partners do |t|
      t.string :name, null: false
      t.integer :contact_id, null: false
      t.boolean :urban

      t.index [:name, :contact_id], unique: true
    end
  end
end
