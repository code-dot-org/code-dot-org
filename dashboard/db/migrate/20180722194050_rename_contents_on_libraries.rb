class RenameContentsOnLibraries < ActiveRecord::Migration[5.0]
  def change
    rename_column :libraries, :contents, :content
  end
end
