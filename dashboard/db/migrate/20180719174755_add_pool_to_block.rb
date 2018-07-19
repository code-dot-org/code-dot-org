class AddPoolToBlock < ActiveRecord::Migration[5.0]
  def change
    add_column :blocks, :pool, :string, null: false, default: ''
  end
end
