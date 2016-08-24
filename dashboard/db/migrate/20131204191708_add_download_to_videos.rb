class AddDownloadToVideos < ActiveRecord::Migration[4.2]
  def change
    add_column :videos, :download, :string
  end
end
