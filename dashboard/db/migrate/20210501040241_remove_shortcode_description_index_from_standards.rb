class RemoveShortcodeDescriptionIndexFromStandards < ActiveRecord::Migration[5.2]
  def change
    remove_index :standards, [:shortcode, :description]
  end
end
