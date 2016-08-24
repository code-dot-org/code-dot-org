class AddQtipConfigToCallout < ActiveRecord::Migration[4.2]
  def change
    add_column :callouts, :qtip_config, :text
  end
end
