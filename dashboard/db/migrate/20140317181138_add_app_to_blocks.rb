class AddAppToBlocks < ActiveRecord::Migration
  def change
    add_column :blocks, :app, :string
  end
end
