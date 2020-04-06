class AddAutoplayEnabledToSection < ActiveRecord::Migration[5.0]
  def change
    add_column :sections, :autoplay_enabled, :boolean, null: false, default: false
  end
end
