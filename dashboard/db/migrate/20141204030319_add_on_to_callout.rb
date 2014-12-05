class AddOnToCallout < ActiveRecord::Migration
  def change
    add_column :callouts, :on, :string
  end
end
