class AddSourceToHints < ActiveRecord::Migration[4.2]
  def change
    add_column :hints, :source, :string
  end
end
