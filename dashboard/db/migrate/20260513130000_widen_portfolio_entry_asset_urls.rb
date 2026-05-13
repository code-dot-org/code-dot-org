class WidenPortfolioEntryAssetUrls < ActiveRecord::Migration[7.0]
  def up
    change_column :portfolio_entries, :before_asset_url, :mediumtext
    change_column :portfolio_entries, :after_asset_url, :mediumtext
  end

  def down
    change_column :portfolio_entries, :before_asset_url, :string
    change_column :portfolio_entries, :after_asset_url, :string
  end
end
