class AddOnToCallout < ActiveRecord::Migration[4.2]
  def change
    add_column :callouts, :on, :string
  end
end
