class AddLocaleColumnToVideos < ActiveRecord::Migration[5.0]
  def change
    add_column :videos, :locale, :string, null: false, default: "en-US"
  end
end
