class RemoveVideoName < ActiveRecord::Migration
  def change
    remove_column :videos, :name
  end
end
