class AddCalloutTextToCallout < ActiveRecord::Migration[4.2]
  def change
    add_column :callouts, :callout_text, :string
  end
end
