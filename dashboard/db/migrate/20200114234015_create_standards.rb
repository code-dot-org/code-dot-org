class CreateStandards < ActiveRecord::Migration[5.0]
  def change
    create_table :standards do |t|
      t.string :organization, null: false
      t.string :organization_id, null: false
      t.text :description
      t.text :concept
    end
  end
end
