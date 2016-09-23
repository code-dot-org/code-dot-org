class RemoveUnusedFieldsFromCallouts < ActiveRecord::Migration[4.2]
  def change
    remove_column :callouts, :qtip_at
    remove_column :callouts, :qtip_my
  end
end
