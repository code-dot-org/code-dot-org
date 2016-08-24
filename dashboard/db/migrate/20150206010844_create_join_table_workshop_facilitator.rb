class CreateJoinTableWorkshopFacilitator < ActiveRecord::Migration[4.2]
  def change
    create_join_table :workshops, :facilitators do |t|
      t.references :workshops, index: true, null: false
      t.references :facilitators, index: true, null: false
    end

    remove_index :workshops, :facilitator_id
    remove_column :workshops, :facilitator_id
  end
end
