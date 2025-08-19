class CreatePortfolioEntries < ActiveRecord::Migration[6.0]
  def change
    create_table :portfolio_entries do |t|
      t.bigint :student_id
      t.string :title
      t.string :before_asset_url
      t.string :before_level_url
      t.string :after_asset_url
      t.string :after_level_url
      t.text :reflection
      
      t.timestamps
    end
  end
end
