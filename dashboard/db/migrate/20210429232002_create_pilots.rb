class CreatePilots < ActiveRecord::Migration[5.2]
  def change
    create_table :pilots do |t|
      t.string :name, null: false
      t.string :display_name, null: false
      t.boolean :allow_joining_via_url, null: false
      t.timestamps

      t.index :name
    end
    reversible do |dir|
      dir.up do
        execute "ALTER TABLE pilots CONVERT TO CHARACTER SET utf8 COLLATE utf8_unicode_ci"
      end
    end
  end
end
