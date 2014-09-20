class AddDownloadToVideos < ActiveRecord::Migration
  def change
    add_column :videos, :download, :string
  end
end
