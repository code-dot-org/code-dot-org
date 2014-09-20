class AddQtipConfigToCallout < ActiveRecord::Migration
  def change
    add_column :callouts, :qtip_config, :text
  end
end
