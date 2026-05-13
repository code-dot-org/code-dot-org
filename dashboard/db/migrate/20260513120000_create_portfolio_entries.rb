class CreatePortfolioEntries < ActiveRecord::Migration[7.0]
  def change
    create_table :portfolio_entries do |t|
      t.references :user, null: false, foreign_key: true, type: :integer
      t.integer :script_id, null: false
      t.integer :level_id, null: false
      t.string :before_asset_url
      t.string :after_asset_url
      t.text :at_first_text
      t.text :but_then_text
      t.text :and_now_text
      t.timestamps
    end
    add_index :portfolio_entries, [:user_id, :script_id, :level_id], unique: true
  end
end
