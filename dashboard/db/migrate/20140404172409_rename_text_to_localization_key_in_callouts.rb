class RenameTextToLocalizationKeyInCallouts < ActiveRecord::Migration[4.2]
  def change
    rename_column :callouts, :text, :localization_key
  end
end
