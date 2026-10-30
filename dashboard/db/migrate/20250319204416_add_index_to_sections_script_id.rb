class AddIndexToSectionsScriptId < ActiveRecord::Migration[6.1]
  def change
    add_index :sections, :script_id
  end
end
