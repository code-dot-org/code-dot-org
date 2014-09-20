class RemoveUnusedFieldsFromCallouts < ActiveRecord::Migration
  def change
    remove_column :callouts, :qtip_at
    remove_column :callouts, :qtip_my
  end
end
