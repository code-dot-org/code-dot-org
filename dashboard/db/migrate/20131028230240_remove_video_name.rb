class RemoveVideoName < ActiveRecord::Migration[4.2]
  def change
    remove_column :videos, :name
  end
end
