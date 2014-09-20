class RenameTextToLocalizationKeyInCallouts < ActiveRecord::Migration
  def change
    rename_column :callouts, :text, :localization_key
  end
end
