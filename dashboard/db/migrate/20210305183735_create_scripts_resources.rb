class CreateScriptsResources < ActiveRecord::Migration[5.2]
  def change
    create_table :scripts_resources do |t|
      t.integer :script_id
      t.integer :resource_id

      t.index [:script_id, :resource_id], unique: true
      t.index [:resource_id, :script_id]
    end
    reversible do |dir|
      dir.up do
        execute "ALTER TABLE scripts_resources CONVERT TO CHARACTER SET utf8 COLLATE utf8_unicode_ci"
      end
    end
  end
end
