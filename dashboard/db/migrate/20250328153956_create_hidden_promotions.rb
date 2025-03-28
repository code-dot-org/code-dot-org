class CreateHiddenPromotions < ActiveRecord::Migration[6.1]
  def change
    create_table :hidden_promotions do |t|
      t.string :promotion_id, null: false
      t.references :teacher, index: true, type: :integer, null: false, foreign_key: {to_table: :users}
      t.column :deleted_at, :datetime, index: true, null: true

      t.timestamps
    end
  end
end
