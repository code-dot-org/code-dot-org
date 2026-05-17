class WidenScrapbookEntryAssetUrls < ActiveRecord::Migration[7.0]
  def up
    change_column :scrapbook_entries, :before_asset_url, :mediumtext
    change_column :scrapbook_entries, :after_asset_url, :mediumtext
  end

  def down
    change_column :scrapbook_entries, :before_asset_url, :string
    change_column :scrapbook_entries, :after_asset_url, :string
  end
end
