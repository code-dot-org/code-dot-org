class AddCalloutTextToCallout < ActiveRecord::Migration
  def change
    add_column :callouts, :callout_text, :string
  end
end
