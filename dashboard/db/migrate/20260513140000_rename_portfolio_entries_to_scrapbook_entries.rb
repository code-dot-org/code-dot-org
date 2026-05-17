class RenamePortfolioEntriesToScrapbookEntries < ActiveRecord::Migration[7.0]
  def up
    return unless table_exists?(:portfolio_entries)
    rename_table :portfolio_entries, :scrapbook_entries
    if index_name_exists?(:scrapbook_entries, :index_portfolio_entries_on_user_id_and_script_id_and_level_id)
      rename_index :scrapbook_entries,
        :index_portfolio_entries_on_user_id_and_script_id_and_level_id,
        :index_scrapbook_entries_on_user_id_and_script_id_and_level_id
    end
    if index_name_exists?(:scrapbook_entries, :index_portfolio_entries_on_user_id)
      rename_index :scrapbook_entries,
        :index_portfolio_entries_on_user_id,
        :index_scrapbook_entries_on_user_id
    end
  end

  def down
    return unless table_exists?(:scrapbook_entries)
    rename_table :scrapbook_entries, :portfolio_entries
    if index_name_exists?(:portfolio_entries, :index_scrapbook_entries_on_user_id_and_script_id_and_level_id)
      rename_index :portfolio_entries,
        :index_scrapbook_entries_on_user_id_and_script_id_and_level_id,
        :index_portfolio_entries_on_user_id_and_script_id_and_level_id
    end
    if index_name_exists?(:portfolio_entries, :index_scrapbook_entries_on_user_id)
      rename_index :portfolio_entries,
        :index_scrapbook_entries_on_user_id,
        :index_portfolio_entries_on_user_id
    end
  end
end
