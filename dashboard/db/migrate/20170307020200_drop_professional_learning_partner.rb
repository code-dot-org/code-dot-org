class DropProfessionalLearningPartner < ActiveRecord::Migration[5.0]
  def change
    # note that in the migration prior to this one, we transfer all data
    # in this table to (and from) another table. Taken together, these
    # two migrations should be fully reversible.
    drop_table :professional_learning_partners
  end
end
