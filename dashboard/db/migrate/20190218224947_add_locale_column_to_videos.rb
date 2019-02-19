class AddLocaleColumnToVideos < ActiveRecord::Migration[5.0]
  def change
    add_column :videos, :locale, :string, null: false, default: "en-US"
    add_index :videos, [:key, :locale], unique: true
  end
end
