class RemoveLinkFromWorkshops < ActiveRecord::Migration[4.2]
  def change
    remove_column :workshops, :link
  end
end
