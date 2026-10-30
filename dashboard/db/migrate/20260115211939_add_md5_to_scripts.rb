class AddMd5ToScripts < ActiveRecord::Migration[6.1]
  def change
    add_column :scripts, :md5, :string
  end
end
