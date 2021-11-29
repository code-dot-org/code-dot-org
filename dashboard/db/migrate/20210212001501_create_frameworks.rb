class CreateFrameworks < ActiveRecord::Migration[5.2]
  def change
    create_table :frameworks do |t|
      t.string :shortcode, null: false
      t.string :name, null: false
      t.text :properties
      t.timestamps

      t.index :shortcode, unique: true
    end
    reversible do |dir|
      dir.up do
        execute "ALTER TABLE frameworks CONVERT TO CHARACTER SET utf8 COLLATE utf8_unicode_ci"
      end
    end
  end
end
