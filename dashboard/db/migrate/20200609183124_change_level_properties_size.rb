class ChangeLevelPropertiesSize < ActiveRecord::Migration[5.0]
  def change
    change_column :levels, :properties, :text, limit: 16_777_215
  end
end
