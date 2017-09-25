class CreateRegionalPartners < ActiveRecord::Migration[5.0]
  def change
    create_table :regional_partners do |t|
      t.string :name, null: false
      t.integer :group, null: false
    end
  end
end
