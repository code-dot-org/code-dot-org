class AddAtAndMyToCallouts < ActiveRecord::Migration[4.2]
  def change
    add_column :callouts, :qtip_at, :string
    add_column :callouts, :qtip_my, :string
  end
end
