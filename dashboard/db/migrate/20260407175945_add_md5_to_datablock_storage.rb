class AddMd5ToDatablockStorage < ActiveRecord::Migration[7.0]
  def change
    add_column :datablock_storage_tables, :md5, :string
  end
end
