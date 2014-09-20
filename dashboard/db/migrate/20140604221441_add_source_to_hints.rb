class AddSourceToHints < ActiveRecord::Migration
  def change
    add_column :hints, :source, :string
  end
end
