class RemoveLinkFromWorkshops < ActiveRecord::Migration
  def change
    remove_column :workshops, :link
  end
end
